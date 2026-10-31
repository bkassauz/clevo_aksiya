create table if not exists settings(key text primary key, value jsonb);
create table if not exists users(tg_id bigint primary key, name text, username text, coins int default 0, created_at timestamptz default now());
create table if not exists codes(code text primary key, used_by bigint, used_at timestamptz, created_at timestamptz default now());
create table if not exists prizes(id serial primary key, name text, icon text, percent numeric default 0, coins int default 0, sort int default 0);
create table if not exists code_log(id bigserial primary key, tg_id bigint, code text, ok boolean, note text, created_at timestamptz default now());
create table if not exists products(id serial primary key, name text, price int, image_url text, created_at timestamptz default now());
create table if not exists points(id serial primary key, name text, address text, landmark text);
create table if not exists gifts(id bigserial primary key, tg_id bigint, title text, icon text, image_url text, source text, cost int default 0, point_id int, status text default 'yetkazilmoqda', created_at timestamptz default now());
alter table settings enable row level security; alter table users enable row level security; alter table codes enable row level security;
alter table prizes enable row level security; alter table code_log enable row level security; alter table products enable row level security;
alter table points enable row level security; alter table gifts enable row level security;
insert into storage.buckets(id,name,public) values('products','products',true) on conflict do nothing;
insert into prizes(name,icon,percent,coins,sort) select * from (values
('50 coin','🪙',30,50,1),('Idish yuvish vositasi','🍽️',15,0,2),('100 coin','🪙',20,100,3),('Kir yuvish geli','🧴',15,0,4),
('Chegirma kuponi','🏷️',10,0,5),('Telefon','📱',1,0,6),('20 coin','🪙',9,20,7)) v where not exists(select 1 from prizes);
