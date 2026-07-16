alter table quotes add column quote_number text;

update quotes
set quote_number = 'QUOTE-' || lpad(sub.rn::text, 4, '0')
from (
  select id, row_number() over (order by created_at) as rn
  from quotes
  where quote_number is null
) sub
where quotes.id = sub.id;

alter table quotes alter column quote_number set not null;
alter table quotes add constraint quotes_quote_number_key unique (quote_number);
