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
const selectedPendingTotal = new DineroInput('#selected-pending-total', 0);
const selectedTransactionsTotal = new DineroInput('#selected-extract-total', 0);


// tabelas
const pendingTransactions = new DataTable('#pending-transactions-table', {
  select: true,
  ordering: false,
  language: { url: '/i18n/datatables.json' },
  columns: [
    { ...defaultColumnConfig, data: 'id_cliente' },
    { ...defaultColumnConfig, data: 'razao_social', searchable: true },
    { ...defaultColumnConfig, data: 'id_titulo_cr' },
    { ...defaultColumnConfig, data: 'data_vencimento', render: formatDate },
    { ...defaultColumnConfig, data: 'valor_residual', render: formatCurrency },
  ]
});
const extract = new DataTable('#extract-table', {
  select: { style: 'multi' },
  ordering: false,
  language: { url: '/i18n/datatables.json' },
  columns: [
    { ...defaultColumnConfig, data: 'data_emissao', render: formatDate },
    { ...defaultColumnConfig, data: 'descricao', searchable: true },
    { ...defaultColumnConfig, data: 'valor', render: formatCurrency },
  ]
});
const history = new DataTable('#history-table', {
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
  url: '/conciliator/pending-transactions',
  type: 'GET',
  success: (response) => {
    selectedPendingTotal.setValue(0);
    pendingTransactions
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
      extract
        .clear()
        .rows.add(response)
        .draw();
    }
  });
});

pendingTransactions.on('select', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  selectedPendingTotal.setValue(data.valor_residual);
});
pendingTransactions.on('deselect', function (_, _, _, _) {
  selectedPendingTotal.setValue(0);
});
extract.on('select', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  changeSelectedTransactionsTotal(data.valor);
});
extract.on('deselect', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  changeSelectedTransactionsTotal(-data.valor);
});

$('#action-btn').on('click', function() {
  if(selectedTransactionsTotal.getDinero().isZero() || selectedPendingTotal.getDinero().isZero()) return;
  if(selectedTransactionsTotal.getDinero().greaterThan(selectedPendingTotal.getDinero())) return;

  const pending = pendingTransactions.row({ selected: true }).data();
  const transactions = extract.rows({ selected: true }).data().toArray();
  let total = selectedPendingTotal.getDinero();
  const result = [];
  
  for(const t of transactions) {
    const value = Dinero({ amount: parseInt(t.valor * 100) });
    const r = {
      id_cliente: pending.id_cliente,
      razao_social: pending.razao_social,
      id_titulo_cr: pending.id_titulo_cr,
      data_vencimento: pending.data_vencimento,
      data_emissao: t.data_emissao,
      valor_residual: total.getAmount() / 100,
      valor_recebido: t.valor
    };
    total = total.subtract(value);
    r.valor_total = total.getAmount() / 100;
    result.push(r);
  }

  history
    .clear()
    .rows.add(result)
    .draw();
  const modal = new bootstrap.Modal('#conciliator-modal', {});
  modal.show();
});