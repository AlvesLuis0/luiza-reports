const defaultColumnConfig = { orderable: false, searchable: false };
var selectedPendingTotal = Dinero({ amount: 0 });
var selectedTransactionsTotal = Dinero({ amount: 0 });


const pendingCustomers = new DataTable('#pending-customers-table', {
  select: true,
  language: { url: '/i18n/datatables.json' },
  columns: [
    { ...defaultColumnConfig, data: 'razao_social', searchable: true, orderable: true },
    { ...defaultColumnConfig, data: 'valor_residual', render: formatCurrency },
  ]
});
const extract = new DataTable('#extract-table', {
  select: { style: 'multi' },
  language: { url: '/i18n/datatables.json' },
  columns: [
    { ...defaultColumnConfig, data: 'data_emissao', render: formatDate },
    { ...defaultColumnConfig, data: 'descricao', searchable: true, orderable: true },
    { ...defaultColumnConfig, data: 'valor', render: formatCurrency },
  ]
});


$.ajax({
  url: '/conciliator/pending-customers',
  type: 'GET',
  success: (response) => {
    pendingCustomers
      .clear()
      .rows.add(response)
      .draw();
  }
});


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
      extract
        .clear()
        .rows.add(response)
        .draw();
    }
  });
});

pendingCustomers.on('select', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  selectedPendingTotal = Dinero({ amount: data.valor_residual * 100 });
  $('#selected-pending-total').text(formatCurrency(selectedPendingTotal.getAmount() / 100));
  checkExtractTotalColor();
});
pendingCustomers.on('deselect', function (_, _, _, _) {
  selectedPendingTotal = Dinero({ amount: 0 });
  $('#selected-pending-total').text(formatCurrency(selectedPendingTotal.getAmount() / 100));
  checkExtractTotalColor();
});
extract.on('select', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  changeSelectedTransactionsTotal(data.valor);
  checkExtractTotalColor();
});
extract.on('deselect', function (_, dt, _, indexes) {
  const data = dt.row(indexes).data();
  changeSelectedTransactionsTotal(-data.valor);
  checkExtractTotalColor();
});

$('#action-btn').on('click', function() {
  if(selectedTransactionsTotal.isZero() || selectedPendingTotal.isZero()) return;
  if(selectedTransactionsTotal.greaterThan(selectedPendingTotal)) return;

  // TODO
});


function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function changeSelectedTransactionsTotal(value) {
  selectedTransactionsTotal = selectedTransactionsTotal.add(Dinero({ amount: parseInt(value * 100) }));
  const total = selectedTransactionsTotal.getAmount() / 100;
  $('#selected-extract-total').text(formatCurrency(total));
}

function checkExtractTotalColor() {
  function isValid() {
    if(selectedTransactionsTotal.isZero() || selectedPendingTotal.isZero()) return false;
    if(selectedTransactionsTotal.greaterThan(selectedPendingTotal)) return false;
    return true;
  }
  
  $('#selected-extract-total').css('color', isValid() ? 'green' : 'red');
}