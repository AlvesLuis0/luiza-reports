export const movementDetailsSql = `
  -- movement
  SELECT
    m.ID_MOVIMENTO AS movement_id
  , m.ID_CAIXA AS cash_register_id
  , m.ID_CODIGO_OPERACAO AS operation_code_id
  , co.TIPO_OPERACAO AS operation_type_flag
  , m."DATA" AS movement_date
  , m.ID_FORMA_VENDA AS sale_method_id
  , m.ID_CLIENTE AS customer_id
  , m.ID_TERCEIRO AS third_party_id
  , m.EMISSAO AS issue_date
  , m.VALOR_MERCADORIA AS merchandise_value
  , m.VALOR_TOTAL AS total_value
  , m.VALOR_TOTAL_LIQUIDO AS net_total_value
  , m.PERC_DESCONTO AS discount_percent
  , m.VALOR_DESCONTO AS discount_value
  , m.PERC_COMISSAO AS commission_percent
  , m.OBSERVACAO AS remarks
  , m.ID_CONSIGNACAO AS consignment_id
  , m.ID_CFOP AS cfop_id
  , m.NUMERO_NOTA AS invoice_number
  , m.SERIE_SELO AS seal_series
  , m.NUMERO_SELO AS seal_number
  , m.BASE_ICMS AS icms_base
  , m.VALOR_ICMS AS icms_value
  , m.BASE_ICMS_SUBST AS icms_substitution_base
  , m.VALOR_ICMS_SUBST AS icms_substitution_value
  , m.VALOR_FRETE AS freight_value
  , m.VALOR_SEGURO AS insurance_value
  , m.VALOR_OUTRAS AS other_expenses_value
  , m.VALOR_IPI AS ipi_value
  , m.SITUACAO AS status_flag
  , m.DATA_ESTORNO AS cancellation_date
  , m.DATA_HORA AS movement_timestamp
  , m.VALOR_DESCONTO_PRCT AS discount_percent_value
  , m.VALOR_LIQUIDO AS net_value
  , m.ID_MOVTO_ORIGEM AS original_movement_id
  , m.VALOR_CREDITO AS credit_value
  , m.ID_LOJA_ENT AS entry_store_id
  , m.ID_LOJA_SAI AS exit_store_id
  , m.VALOR_NAO_COMISSIONADO AS non_commissioned_value
  , m.VALOR_COMISSAO AS commission_value
  , m.VALOR_ACRESCIMO AS increase_value
  , m.VR_OUTROS_DESCONTOS AS other_discounts_value
  , m.ID_MOVTO_SAIDA AS exit_movement_id
  -- items
  , pg.ID_PRODUTO AS product_id
  , mi.ID_GRADE_PROD AS product_grade_id
  , mi.QUANTIDADE AS quantity
  , mi.PRECO_UNITARIO AS unit_price
  , mi.PRECO_AQUISICAO AS acquisition_price
  , mi.PRECO_CUSTO AS cost_price
  , mi.PRECO_VENDA AS sale_price
  , mi.PROMOCAO AS promotion_flag
  , mi.COMISSIONADO AS commissioned_flag
  , mi.VALOR_DESCONTO AS item_discount_value
  , mi.DEVOLUCAO_TROCA AS return_or_exchange_flag
  FROM MOVIMENTOS m
  JOIN CODIGOS_OPERACAO co ON co.ID_CODIGO_OPERACAO = m.ID_CODIGO_OPERACAO
  JOIN MOVIMENTOS_ITENS mi ON m.ID_MOVIMENTO = mi.ID_MOVIMENTO
  JOIN PRODUTOS_GRADE pg ON pg.ID_GRADE_PROD = mi.ID_GRADE_PROD
`;