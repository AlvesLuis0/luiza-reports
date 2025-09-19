// utils
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(date) {
  const [year, month, day] = date.replace('T', '-').split("-");
  return `${day}/${month}/${year}`;
}

function changeSelectedTransactionsTotal(value) {
  value = Dinero({ amount: parseInt(value * 100) });
  const newTotal = selectedTransactionsTotal.getDinero().add(value);
  selectedTransactionsTotal.setValue(newTotal.getAmount() / 100);
}

class DineroInput {
  constructor(selector, value) {
    this.input = $(selector);
    this.setValue(value);
  }

  getValue() {
    return this.getDinero().getAmount() / 100;
  }

  getDinero() {
    return this.value;
  }

  setValue(value) {
    this.value = Dinero({ amount: parseInt(value * 100) })
    this.input.text(formatCurrency(this.getValue()));
  }
}


// constantes e variáveis globais
const defaultColumnConfig = { orderable: false, searchable: false };
const selectedCustomerTotal = new DineroInput('#selected-customer-total', 0);
const selectedTransactionsTotal = new DineroInput('#selected-extract-total', 0);


// tabelas
const pendingCustomersTable = new DataTable('#pending-customers-table', {
  select: true,
  language: { url: '/i18n/datatables.json' },
  columns: [
    { data: 'id_cliente' },
    { data: 'razao_social' },
    { ...defaultColumnConfig, data: 'valor_residual', render: formatCurrency },
  ]
});
const extractTable = new DataTable('#extract-table', {
  select: { style: 'multi' },
  ordering: false,
  language: { url: '/i18n/datatables.json' },
  columns: [
    { ...defaultColumnConfig, data: 'data_emissao', render: formatDate },
    { ...defaultColumnConfig, data: 'descricao', searchable: true },
    { ...defaultColumnConfig, data: 'valor', render: formatCurrency },
  ]
});
const historyTable = new DataTable('#history-table', {
  language: { url: '/i18n/datatables.json' },
  ordering: false,
  searching: false,
  paging: false,
  columns: [
    { data: 'id_cliente' },
    { data: 'razao_social' },
    { data: 'id_titulo_cr' },
    { data: 'data_vencimento', render: formatDate },
    { data: 'data_emissao', render: formatDate },
    { data: 'valor_residual', render: formatCurrency },
    { data: 'valor_recebido', render: formatCurrency },
    { data: 'valor_total', render: formatCurrency },
  ]
});


// início
$.ajax({
  url: '/conciliator/pending-customers',
  type: 'GET',
  success: (response) => {
    selectedCustomerTotal.setValue(0);
    pendingCustomersTable
      .clear()
      .rows.add(response)
      .draw();
  }
});


// listeners
$('#files').on('change', function() { $('form').submit() })
$('form').on('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(this);
  $.ajax({
    url: '/conciliator/import-extract',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function(response) {
      selectedTransactionsTotal.setValue(0);
      extractTable
        .clear()
        .rows.add(response)
        .draw();
    }
  });
});

pendingCustomersTable.on('select', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  selectedCustomerTotal.setValue(data.valor_residual);
});
pendingCustomersTable.on('deselect', function (_, _, _, _) {
  selectedCustomerTotal.setValue(0);
});
extractTable.on('select', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  changeSelectedTransactionsTotal(data.valor);
});
extractTable.on('deselect', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  changeSelectedTransactionsTotal(-data.valor);
});

$('#action-btn').on('click', function() {
  if(selectedTransactionsTotal.getDinero().isZero() || selectedCustomerTotal.getDinero().isZero()) return;
  if(selectedTransactionsTotal.getDinero().greaterThan(selectedCustomerTotal.getDinero())) return;

  const customer = pendingCustomersTable.row({ selected: true }).data();
  const transactions = extractTable.rows({ selected: true }).data().toArray();

  $.ajax({
    url: '/conciliator/pre-conciliate',
    type: 'POST',
    data: JSON.stringify({ customer, transactions }),
    contentType: 'application/json',
    processData: false,
    success: function(response) {
      historyTable
        .clear()
        .rows.add(response.history)
        .draw();
      const modal = new bootstrap.Modal('#conciliator-modal', {});
      modal.show();
    }
  })
});