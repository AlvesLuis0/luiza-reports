const defaultColumnConfig = { orderable: false, searchable: false };
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

extract.on('select', function ( e, dt, type, indexes ) {
  const data = dt.row(indexes).data();
  changeSelectedTotal(data.valor);
} );
extract.on('deselect', function ( e, dt, type, indexes ) {
  const data = dt.row(indexes).data();
  changeSelectedTotal(-data.valor);
} );

$('#action-btn').on('click', function() {
  const pendingValue = Dinero({ amount: parseInt((pendingCustomers.row({ selected: true }).data() || {}).valor_residual * 100 || 0) });

  if(selectedTransactionsTotal.isZero() || pendingValue.isZero()) return;
  if(selectedTransactionsTotal.greaterThan(pendingValue)) return;

  console.log(pendingValue.getAmount());
  console.log(selectedTransactionsTotal.getAmount());
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

function changeSelectedTotal(value) {
  selectedTransactionsTotal = selectedTransactionsTotal.add(Dinero({ amount: parseInt(value * 100) }));
  const total = selectedTransactionsTotal.getAmount() / 100;
  $('#selected-total').text(formatCurrency(total));
}