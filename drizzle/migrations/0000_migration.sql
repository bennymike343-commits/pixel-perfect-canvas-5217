create type public.app_role as enum ('admin','user');
create type public.order_status as enum ('pending','processing','shipped','delivered','cancelled');

create table public.profiles (
  id uuid primary key,
  full_name text, phone text, address text, state text, city text, email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, role app_role not null, unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  if (lower(new.email) = 'udojoshuasunday@gmail.com') then
    insert into public.user_roles(user_id, role) values (new.id,'admin') on conflict do nothing;
  end if;
  insert into public.user_roles(user_id, role) values (new.id,'user') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text not null default '',
  category text not null, price integer not null check (price >= 0),
  stock integer not null default 0, image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read products" on public.products for select to anon, authenticated using (true);
create policy "admin write products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  full_name text not null, phone text not null, address text not null, state text not null, city text not null,
  subtotal integer not null, delivery_fee integer not null default 0, total integer not null,
  status order_status not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "read orders" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "insert own orders" on public.orders for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "admin update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null, price integer not null, quantity integer not null check (quantity > 0), image_url text
);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "read items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "insert own items" on public.order_items for insert to authenticated with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- decrement stock on order item insert
create or replace function public.decrement_stock() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.products set stock = greatest(stock - new.quantity, 0) where id = new.product_id;
  return new;
end $$;
create trigger order_item_stock after insert on public.order_items for each row execute function public.decrement_stock();

create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "admin update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

insert into public.products (name, description, category, price, stock, image_url, featured) values
('VoltCore 20000mAh Power Bank','High-capacity 20,000mAh power bank with 22.5W fast charging, dual USB-A and USB-C PD. Charges most phones 4–5 times. Ideal for NEPA outages.','power-banks',18500,24,'/products/powerbank.jpg',true),
('Braided USB-C Cable 2m','Tough nylon-braided USB-C to USB-C cable, 65W fast charging and data transfer. Built to survive daily use.','cables',3200,80,'/products/cable.jpg',true),
('Solar Inverter 1kVA','1kVA pure sine wave hybrid inverter with built-in MPPT solar charge controller. Powers TV, fans, lights and laptops.','solar',124000,6,'/products/inverter.jpg',true),
('65W GaN USB-C Charger','Compact GaN wall charger with 2 USB-C and 1 USB-A port. Fast-charges phones, tablets and laptops. UK 3-pin plug.','chargers',14500,30,'/products/charger.jpg',true),
('LED Bulbs 9W (Pack of 10)','Energy-saving 9W LED bulbs, cool daylight, E27 screw base. Bright light, low power usage.','bulbs',4800,50,'/products/bulbs.jpg',false),
('13A Double Socket Plate','Durable 13A twin switched socket outlet with neon indicators. Standard UK/Nigeria fitting.','sockets',1500,120,'/products/socket.jpg',false),
('4-Way Surge Extension','4-gang extension box with surge protection, 2 USB ports and 3m heavy-duty cord.','sockets',6500,40,'/products/extension.jpg',false),
('2.5mm Copper Wire (100m)','Pure copper 2.5mm single-core cable, 100m coil. For house wiring and sockets.','wires',38500,15,'/products/wire.jpg',false),
('DSTV/GOTV LNB & Remote Kit','Universal single LNB with replacement DSTV/GOTV remote control. Easy setup.','dstv',6750,35,'/products/dstv.jpg',true),
('200W Solar Panel','Monocrystalline 200W solar panel with high efficiency cells and aluminium frame.','solar',72000,10,'/products/solarpanel.jpg',false),
('Rechargeable LED Lamp','Portable rechargeable lamp with 3 brightness modes and up to 12 hours runtime.','bulbs',5500,45,'/products/lamp.jpg',false),
('Clear Phone Case + Tempered Glass','Shockproof clear case with 9H tempered glass screen protector. Available for popular Samsung, Tecno, Infinix and iPhone models.','phone-accessories',3500,100,'/products/phonecase.jpg',true),
('Wireless Earbuds Pro','Bluetooth 5.3 earbuds with charging case, deep bass and 24-hour total battery life.','phone-accessories',12500,28,'/products/earbuds.jpg',false),
('Circuit Breaker 32A','Single-pole 32A MCB for distribution boards. Protects against overload and short circuit.','electrical',2800,60,'/products/breaker.jpg',false);