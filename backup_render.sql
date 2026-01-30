--
-- PostgreSQL database dump
--

\restrict lPhQWJJ1VkfOgqmwxOh8UUJxjF9bMqiiQQegbvc6Oe4LExolRyCZE4fYmfnxA7u

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: iqos_shop_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO iqos_shop_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bonus_transactions; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.bonus_transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount double precision NOT NULL,
    transaction_type character varying NOT NULL,
    description character varying,
    order_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bonus_transactions OWNER TO iqos_shop_user;

--
-- Name: bonus_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.bonus_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bonus_transactions_id_seq OWNER TO iqos_shop_user;

--
-- Name: bonus_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.bonus_transactions_id_seq OWNED BY public.bonus_transactions.id;


--
-- Name: broadcasts; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.broadcasts (
    id integer NOT NULL,
    message text NOT NULL,
    status character varying DEFAULT 'draft'::character varying,
    send_immediately boolean DEFAULT true,
    scheduled_time timestamp without time zone,
    repeat_enabled boolean DEFAULT false,
    repeat_interval_hours integer,
    repeat_count integer DEFAULT 0,
    max_repeats integer,
    last_sent_at timestamp without time zone,
    total_recipients integer DEFAULT 0,
    sent_count integer DEFAULT 0,
    failed_count integer DEFAULT 0,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.broadcasts OWNER TO iqos_shop_user;

--
-- Name: broadcasts_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.broadcasts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.broadcasts_id_seq OWNER TO iqos_shop_user;

--
-- Name: broadcasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.broadcasts_id_seq OWNED BY public.broadcasts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type character varying DEFAULT 'devices'::character varying
);


ALTER TABLE public.categories OWNER TO iqos_shop_user;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO iqos_shop_user;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.favorites OWNER TO iqos_shop_user;

--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO iqos_shop_user;

--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE public.order_items OWNER TO iqos_shop_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO iqos_shop_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total_amount double precision NOT NULL,
    status character varying,
    delivery_type character varying NOT NULL,
    full_name character varying NOT NULL,
    phone character varying NOT NULL,
    payment_method character varying NOT NULL,
    delivery_address text,
    delivery_time character varying,
    delivery_date character varying,
    city character varying,
    europost_office character varying,
    comment text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    bonus_used double precision DEFAULT 0.0,
    bonus_earned double precision DEFAULT 0.0,
    delivery_cost double precision DEFAULT 0.0
);


ALTER TABLE public.orders OWNER TO iqos_shop_user;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO iqos_shop_user;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    price double precision NOT NULL,
    image_url character varying,
    category character varying,
    badge character varying,
    is_active boolean,
    stock integer,
    created_at timestamp without time zone
);


ALTER TABLE public.products OWNER TO iqos_shop_user;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO iqos_shop_user;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: saved_addresses; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.saved_addresses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying NOT NULL,
    delivery_type character varying NOT NULL,
    address text,
    city character varying,
    europost_office character varying,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_addresses OWNER TO iqos_shop_user;

--
-- Name: saved_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.saved_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_addresses_id_seq OWNER TO iqos_shop_user;

--
-- Name: saved_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.saved_addresses_id_seq OWNED BY public.saved_addresses.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: iqos_shop_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    telegram_id bigint NOT NULL,
    username character varying,
    first_name character varying,
    last_name character varying,
    is_active boolean,
    created_at timestamp without time zone,
    saved_full_name character varying,
    saved_phone character varying,
    saved_delivery_address text,
    saved_city character varying,
    saved_europost_office character varying,
    saved_delivery_type character varying,
    bonus_balance double precision DEFAULT 0.0,
    total_orders_count integer DEFAULT 0,
    loyalty_level character varying DEFAULT 'bronze'::character varying,
    role character varying DEFAULT 'customer'::character varying
);


ALTER TABLE public.users OWNER TO iqos_shop_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: iqos_shop_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO iqos_shop_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iqos_shop_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: bonus_transactions id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.bonus_transactions ALTER COLUMN id SET DEFAULT nextval('public.bonus_transactions_id_seq'::regclass);


--
-- Name: broadcasts id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.broadcasts ALTER COLUMN id SET DEFAULT nextval('public.broadcasts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: saved_addresses id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.saved_addresses ALTER COLUMN id SET DEFAULT nextval('public.saved_addresses_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: bonus_transactions; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.bonus_transactions (id, user_id, amount, transaction_type, description, order_id, created_at) FROM stdin;
1	1	1.88	earned	Начислено за заказ #9 (1.5% кэшбэк)	9	2026-01-15 22:21:45.850338
2	1	-1.88	spent	Оплата заказа #10	10	2026-01-22 15:27:12.422338
3	1	1.06	earned	Начислено за заказ #10 (0.8% кэшбэк)	10	2026-01-22 15:41:01.610543
4	1	1.85	earned	Начислено за заказ #11 (0.8% кэшбэк)	11	2026-01-22 19:54:24.369046
5	1	2	earned	Начислено за заказ #13 (1.5% кэшбэк)	13	2026-01-27 12:53:18.020434
\.


--
-- Data for Name: broadcasts; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.broadcasts (id, message, status, send_immediately, scheduled_time, repeat_enabled, repeat_interval_hours, repeat_count, max_repeats, last_sent_at, total_recipients, sent_count, failed_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.categories (id, name, description, is_active, sort_order, created_at, type) FROM stdin;
1	Iqos duos original	\N	t	0	2026-01-24 12:32:00.548644	devices
2	Iqos iluma one	\N	t	1	2026-01-24 12:32:00.548644	devices
3	Iqos iluma i series prime	\N	t	2	2026-01-24 12:32:00.548644	devices
6	Iqos Original One	\N	t	5	2026-01-24 12:32:00.548644	devices
8	Iqos iluma	\N	t	7	2026-01-24 12:32:00.548644	devices
9	Iqos 3.0 Duos	\N	t	8	2026-01-24 12:32:00.548644	devices
12	IQOS LIL SOLID DUAL	\N	t	11	2026-01-24 12:32:00.548644	devices
13	Iqos lil solid 3.0 ez	\N	t	12	2026-01-24 12:32:00.548644	devices
15	Iqos iluma prime	\N	t	14	2026-01-24 12:32:00.548644	devices
4	Terea eu/ind	\N	t	3	2026-01-24 12:32:00.548644	sticks
11	Terea kz	\N	t	10	2026-01-24 12:32:00.548644	sticks
7	Парламент ru	\N	t	6	2026-01-24 12:32:00.548644	sticks
10	Heets kz	\N	t	9	2026-01-24 12:32:00.548644	sticks
5	FiiT ru/kz	\N	t	4	2026-01-24 12:32:00.548644	sticks
14	Terea arm	\N	t	13	2026-01-24 12:32:00.548644	sticks
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.favorites (id, user_id, product_id, created_at) FROM stdin;
2	1	1	2026-01-15 10:19:54.568643
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
1	1	59	1	180
2	2	1	1	125
3	3	63	1	165
4	4	64	1	140
5	5	1	1	125
6	6	2	1	98
7	7	2	1	98
8	8	3	1	89
9	9	1	1	125
10	10	1	1	125
11	11	1	1	125
12	11	2	1	98
13	12	1	1	125
14	13	1	1	125
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.orders (id, user_id, total_amount, status, delivery_type, full_name, phone, payment_method, delivery_address, delivery_time, delivery_date, city, europost_office, comment, created_at, updated_at, bonus_used, bonus_earned, delivery_cost) FROM stdin;
3	1	165	cancelled	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-24	\N	\N	\N	2026-01-14 12:09:03.883898	2026-01-14 12:18:45.699168	0	0	0
2	1	125	cancelled	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	\N	\N	\N	\N	2026-01-14 11:58:38.80552	2026-01-14 12:18:49.359762	0	0	0
1	1	180	confirmed	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-17	\N	\N	\N	2026-01-14 11:49:19.77441	2026-01-14 17:26:23.143244	0	0	0
4	2	140	cancelled	minsk	Artem test	291465246	cash	Леакова	13:00-17:00	2026-01-14	\N	\N	\N	2026-01-14 17:28:23.107406	2026-01-15 10:08:51.64332	0	0	0
5	1	125	cancelled	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-16	\N	\N	\N	2026-01-15 10:39:59.847797	2026-01-15 10:41:16.690048	0	0	0
6	1	98	cancelled	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-17	\N	\N	\N	2026-01-15 10:54:45.430792	2026-01-15 10:55:00.913778	0	0	0
7	1	98	confirmed	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-20	\N	\N	\N	2026-01-15 11:04:03.283138	2026-01-15 11:04:17.607209	0	0	0
8	1	89	confirmed	europost	морозов никита	+375296934501	cash	\N	\N	\N	могилев	123	\N	2026-01-15 11:55:09.316018	2026-01-15 14:13:58.461836	0	0	0
9	1	125	confirmed	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-17	\N	\N	\N	2026-01-15 22:21:27.458545	2026-01-15 22:21:45.852718	0	1.88	0
10	1	131.12	confirmed	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-23	\N	\N	\N	2026-01-22 15:27:12.413357	2026-01-22 15:41:01.612415	1.88	1.06	8
11	1	231	confirmed	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-24	\N	\N	\N	2026-01-22 19:54:10.978141	2026-01-22 19:54:24.371007	0	1.85	8
12	1	133	cancelled	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-24	\N	\N	\N	2026-01-22 20:05:17.576179	2026-01-22 20:05:24.416193	0	0	8
13	1	133	confirmed	minsk	морозов никита	+375296934501	cash	якуба коласа	13:00-17:00	2026-01-27	\N	\N	\N	2026-01-27 12:53:01.379728	2026-01-27 12:53:18.022765	0	2	8
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.products (id, name, description, price, image_url, category, badge, is_active, stock, created_at) FROM stdin;
1	Purple Wawe	Черника с ментоловыми нотами в аромате табачного аэрозоля	125	https://cdn.ibot.by/shop/3080/item446976.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890122
2	Turquoise selection	Аромат ментола	98	https://cdn.ibot.by/shop/3080/item447757.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890126
3	Purple Wave	Аромат тёмные ягоды	89	https://cdn.ibot.by/shop/3080/item461966.webp	Heets kz	ХИТ	t	100	2026-01-14 11:47:56.890129
4	Turquoise Sеlection	Аромат ментол	85	https://cdn.ibot.by/shop/3080/item461968.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.89013
5	Summer Breeze	Аромат персик-ментол	85	https://cdn.ibot.by/shop/3080/item461971.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890131
6	Green Zing	Аромат цитрус-ментол	85	https://cdn.ibot.by/shop/3080/item461972.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890131
7	Yellow Selection	Аромат мягкий табак	85	https://cdn.ibot.by/shop/3080/item461973.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890132
8	Bronze Selection	Аромат насыщенный табак	85	https://cdn.ibot.by/shop/3080/item461974.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890133
9	Amber Selection	Аромат классический табак	85	https://cdn.ibot.by/shop/3080/item461975.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890134
10	Silver Selection	Аромат мягкий табак	85	https://cdn.ibot.by/shop/3080/item461976.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890134
11	Ruby Fuse	Аромат красные ягоды	80	https://cdn.ibot.by/shop/3080/item461978.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890135
12	Tropical Swift	Аромат тропические фрукты	78	https://cdn.ibot.by/shop/3080/item461979.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890135
13	Yellow Green Selection	Аромат цитрус	85	https://cdn.ibot.by/shop/3080/item461980.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890136
14	Arbor Pearl RU	Аромат садовые фрукты	98	https://cdn.ibot.by/shop/2777/item493736.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890137
15	Sun Pearl RU	Аромат летние ягоды	98	https://cdn.ibot.by/shop/2777/item493737.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890137
16	Delicate Citrus	Аромат цитрус с орехами	87	https://cdn.ibot.by/shop/3080/item485423.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890138
17	Fresh Floral	Аромат цветочная свежесть	87	https://cdn.ibot.by/shop/3080/item485424.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890139
18	Fragrant Herbs	Аромат мятные травы	85	https://cdn.ibot.by/shop/3080/item485425.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890139
19	Purplе Wave	Аромат темные ягоды	98	https://cdn.ibot.by/shop/3080/item485426.webp	Парламент ru	ХИТ	t	100	2026-01-14 11:47:56.89014
20	Summеr Breeze	Аромат персик-ментол	98	https://cdn.ibot.by/shop/3080/item485427.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.89014
21	Greеn Zing	Аромат цитрус-ментол	98	https://cdn.ibot.by/shop/3080/item485428.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890141
22	Slate Selection	Аромат умеренный табак	98	https://cdn.ibot.by/shop/3080/item485429.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890142
23	Bronze Selеction	Аромат насыщенный табак	98	https://cdn.ibot.by/shop/3080/item485430.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890142
24	Gold Selection	Аромат легкая свежесть	98	https://cdn.ibot.by/shop/3080/item485431.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890143
25	Amber Selеction	Аромат классический табак	98	https://cdn.ibot.by/shop/3080/item485432.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890144
26	Amarelo Fuse	Аромат цитрус-ментол	85	https://cdn.ibot.by/shop/3080/item485433.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890144
27	Ruby Fusе	Аромат красные ягоды	98	https://cdn.ibot.by/shop/3080/item485434.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890145
28	Turquoise	Сочетание охлаждающих ментоловых ноток, ярко выраженное среди мощной табачной основы	125	https://cdn.ibot.by/shop/3080/item485435.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890145
29	Summer Wave	Свежесть спелого персика с нотками мяты	125	https://cdn.ibot.by/shop/3080/item485436.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890146
30	Grееn Zing	Табак, цитрусовые, пряные травы и ментол	125	https://cdn.ibot.by/shop/3080/item485437.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890147
31	Yellow	Аромат отборного табачного бленда с цитрусовым ароматом и легкими пряными нотками	125	https://cdn.ibot.by/shop/3080/item485438.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890147
32	Bronze	Аромат отборного табачного бледна, в ароматической симфонии которого присутствуют нотки какао с деликатным отголоском сухофруктов	120	https://cdn.ibot.by/shop/3080/item485439.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890148
33	Amber	Насыщенный табачный вкус. Янтарные ноты мягко раскрываются в процессе парения и плавно переходят в легкое цитрусовое, древесное и ореховое послевкусие	125	https://cdn.ibot.by/shop/3080/item485440.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890148
34	Silver	Чистый табачный вкус, без каких либо ароматизаторов	125	https://cdn.ibot.by/shop/3080/item485441.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890149
35	Rubу Fuse	Со вкусом табака и едва ощутимыми нотками малины в аромате	120	https://cdn.ibot.by/shop/3080/item485442.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.89015
36	Black Green	Аромат крепкого табака с ментолом и зелеными фруктами	195	https://cdn.ibot.by/shop/3080/item485443.webp	Terea eu/ind	ХИТ	t	100	2026-01-14 11:47:56.89015
37	Bright	Необычный вкус с глубокими ментоловыми охлаждающими ощущениями, ароматами зеленых фруктов и свежести	195	https://cdn.ibot.by/shop/3080/item485444.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890151
69	Iqos iluma one Moss Green		170	https://cdn.ibot.by/shop/3080/item490667.webp	Iqos iluma one	\N	t	100	2026-01-14 11:47:56.89017
38	Bronzе	Аромат отборного табачного бленда, в ароматической симфонии которого присутствуют нотки какао с деликатным отголоском сухофруктов	195	https://cdn.ibot.by/shop/3080/item485445.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890151
39	Yugen	Аромат свежего вкуса и нотами сочной груши, лаванды и жасминового чая в аромате табачного аэрозоля	195	https://cdn.ibot.by/shop/3080/item485446.webp	Terea eu/ind	ХИТ	t	100	2026-01-14 11:47:56.890152
40	Apricity	Табак с персиком и древесными нотками со сливками	195	https://cdn.ibot.by/shop/3080/item485447.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890153
41	Siena	Табак с древесными и чайными нотками	195	https://cdn.ibot.by/shop/3080/item485448.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890153
42	Grеen Zing	Сбалансированное ментоловое охлаждение в сочетании со слегка подаренной табачной смесью, обогащенное нотами зеленого мятного аромата	195	https://cdn.ibot.by/shop/3080/item485449.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890154
43	Purple Wavе	Черника с ментоловыми нотами в аромате табачного аэрозоля	195	https://cdn.ibot.by/shop/3080/item485450.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890154
44	Berrine Edition	Охлаждающий цветочно табачный аромат с индонезийской гвоздикой	195	https://cdn.ibot.by/shop/3080/item485451.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890155
45	Mulint Edition	Охлаждающий фруктово табачный аромат с индонезийской гвоздикой	195	https://cdn.ibot.by/shop/3080/item485452.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890155
46	Auburn Edition	Сбалансированный фруктово табачный аромат с индонезийской гвоздикой	195	https://cdn.ibot.by/shop/3080/item485453.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890156
47	Golden Edition	Мягкая смесь табака с настоящим вкусом гвоздики и ароматом сливы	195	https://cdn.ibot.by/shop/3080/item485454.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890156
48	Emerald Edition	Сочетание свежего табака и настоящей гвоздики в сочетании с прохладой ментола и зеленых яблок	195	https://cdn.ibot.by/shop/3080/item485455.webp	Terea eu/ind	\N	t	100	2026-01-14 11:47:56.890157
49	Blue	Сочетание свежего табака и настоящей гвоздики в сочетании с прохладой ментола и зеленых яблок	195	https://cdn.ibot.by/shop/3080/item485456.webp	Terea eu/ind	ХИТ	t	100	2026-01-14 11:47:56.890158
50	Spring	Абрикос с ментолом	70	https://cdn.ibot.by/shop/3080/item485459.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.890158
51	Viola	Ежевика с ментолом	70	https://cdn.ibot.by/shop/3080/item485460.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.890159
52	Marine	Ментол	70	https://cdn.ibot.by/shop/3080/item485461.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.89016
53	Regullar Deep	Насыщенный табак	70	https://cdn.ibot.by/shop/3080/item485462.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.89016
54	Crisp	Лимон с ментолом	70	https://cdn.ibot.by/shop/3080/item485463.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.890161
55	Velvet	Темные ягоды	70	https://cdn.ibot.by/shop/3080/item485464.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.890161
56	Tropic	Тропические фрукты	70	https://cdn.ibot.by/shop/3080/item485465.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.890162
57	Twilight Pearl	Черника с ментолом	125	https://cdn.ibot.by/shop/3080/item485466.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890163
58	Sun Pеarl	Арбуз с ментолом	125	https://cdn.ibot.by/shop/3080/item485467.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890163
59	Iqos Original One Scarlet Red		180	https://cdn.ibot.by/shop/3080/item490655.webp	Iqos Original One	\N	t	100	2026-01-14 11:47:56.890164
60	Iqos Original One Silver		180	https://cdn.ibot.by/shop/3080/item490656.webp	Iqos Original One	\N	t	100	2026-01-14 11:47:56.890165
61	Iqos Original One Turquoise		180	https://cdn.ibot.by/shop/3080/item490657.webp	Iqos Original One	\N	t	100	2026-01-14 11:47:56.890165
62	Iqos Original One Slate Black		180	https://cdn.ibot.by/shop/3080/item490658.webp	Iqos Original One	\N	t	100	2026-01-14 11:47:56.890166
63	Iqos duos original Scarlet Red		165	https://cdn.ibot.by/shop/3080/item490659.webp	Iqos duos original	\N	t	100	2026-01-14 11:47:56.890166
64	Iqos duos original Silver		140	https://cdn.ibot.by/shop/3080/item490660.webp	Iqos duos original	\N	t	100	2026-01-14 11:47:56.890167
65	Iqos duos original Turquoise		165	https://cdn.ibot.by/shop/3080/item490661.webp	Iqos duos original	\N	t	100	2026-01-14 11:47:56.890168
67	Iqos iluma one Azure Blue		170	https://cdn.ibot.by/shop/3080/item490665.webp	Iqos iluma one	\N	t	100	2026-01-14 11:47:56.890169
68	Iqos iluma one Pebble Gray		170	https://cdn.ibot.by/shop/3080/item490666.webp	Iqos iluma one	\N	t	100	2026-01-14 11:47:56.890169
70	Iqos iluma one Sunset Red		170	https://cdn.ibot.by/shop/3080/item490668.webp	Iqos iluma one	\N	t	100	2026-01-14 11:47:56.89017
71	Iqos iluma one Pebble Beige		170	https://cdn.ibot.by/shop/3080/item490670.webp	Iqos iluma one	\N	t	100	2026-01-14 11:47:56.890171
72	Iqos iluma Sunset Red		260	https://cdn.ibot.by/shop/3080/item490671.webp	Iqos iluma	\N	t	100	2026-01-14 11:47:56.890172
73	Iqos iluma Azure Blue		260	https://cdn.ibot.by/shop/3080/item490672.webp	Iqos iluma	\N	t	100	2026-01-14 11:47:56.890173
74	Iqos iluma Pebble Beige		260	https://cdn.ibot.by/shop/3080/item490682.webp	Iqos iluma	\N	t	100	2026-01-14 11:47:56.890173
75	Iqos iluma Pebble Gray		260	https://cdn.ibot.by/shop/3080/item490683.webp	Iqos iluma	\N	t	100	2026-01-14 11:47:56.890174
76	Iqos iluma Moss Green		260	https://cdn.ibot.by/shop/3080/item490684.webp	Iqos iluma	\N	t	100	2026-01-14 11:47:56.890175
77	Iqos iluma prime Bronze Taupe		400	https://cdn.ibot.by/shop/3080/item490685.webp	Iqos iluma prime	\N	t	100	2026-01-14 11:47:56.890175
78	Iqos iluma prime Jade Green		400	https://cdn.ibot.by/shop/3080/item490686.webp	Iqos iluma prime	\N	t	100	2026-01-14 11:47:56.890176
79	Iqos iluma prime Gold		400	https://cdn.ibot.by/shop/3080/item490687.webp	Iqos iluma prime	\N	t	100	2026-01-14 11:47:56.890176
80	Iqos iluma prime Black		400	https://cdn.ibot.by/shop/3080/item490688.webp	Iqos iluma prime	\N	t	100	2026-01-14 11:47:56.890177
81	Iqos iluma i series prime Aspen Green		450	https://cdn.ibot.by/shop/3080/item490689.webp	Iqos iluma i series prime	\N	t	100	2026-01-14 11:47:56.890178
82	Iqos iluma i series prime Breez Blue		450	https://cdn.ibot.by/shop/3080/item490690.webp	Iqos iluma i series prime	\N	t	100	2026-01-14 11:47:56.890178
83	Iqos iluma i series prime Midnight Black		450	https://cdn.ibot.by/shop/3080/item490691.webp	Iqos iluma i series prime	\N	t	100	2026-01-14 11:47:56.890179
84	Iqos iluma i series prime Purple		450	https://cdn.ibot.by/shop/3080/item490692.webp	Iqos iluma i series prime	\N	t	100	2026-01-14 11:47:56.890179
85	Iqos lil solid 3.0 ez White		105	https://cdn.ibot.by/shop/3080/item490694.webp	Iqos lil solid 3.0 ez	\N	t	100	2026-01-14 11:47:56.89018
86	Iqos lil solid 3.0 ez Green		115	https://cdn.ibot.by/shop/3080/item490695.webp	Iqos lil solid 3.0 ez	\N	t	100	2026-01-14 11:47:56.890181
87	Iqos lil solid 3.0 ez Gold		115	https://cdn.ibot.by/shop/3080/item490696.webp	Iqos lil solid 3.0 ez	\N	t	100	2026-01-14 11:47:56.890181
88	Iqos lil solid 3.0 ez Blue		115	https://cdn.ibot.by/shop/3080/item490697.webp	Iqos lil solid 3.0 ez	\N	t	100	2026-01-14 11:47:56.890182
89	Iqos lil solid 3.0 ez Black		105	https://cdn.ibot.by/shop/3080/item490698.webp	Iqos lil solid 3.0 ez	\N	t	100	2026-01-14 11:47:56.890183
90	Iqos lil solid 3.0 ez Pink		105	https://cdn.ibot.by/shop/3080/item490699.webp	Iqos lil solid 3.0 ez	\N	t	100	2026-01-14 11:47:56.890183
91	Iqos 3.0 Duos Blue		170	https://cdn.ibot.by/shop/3080/item490700.webp	Iqos 3.0 Duos	\N	t	100	2026-01-14 11:47:56.890184
92	Iqos 3.0 Duos White		120	https://cdn.ibot.by/shop/3080/item490701.webp	Iqos 3.0 Duos	\N	t	100	2026-01-14 11:47:56.890184
93	Iqos 3.0 Duos Gold		120	https://cdn.ibot.by/shop/3080/item490702.webp	Iqos 3.0 Duos	\N	t	100	2026-01-14 11:47:56.890185
94	Iqos 3.0 Duos Black		120	https://cdn.ibot.by/shop/3080/item490703.webp	Iqos 3.0 Duos	\N	t	100	2026-01-14 11:47:56.890185
95	Heets Twilight	ягодная капсула	98	https://cdn.ibot.by/shop/2777/item748333.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890186
96	Arbor Pearl	Аромат садовые фрукты	77	https://cdn.ibot.by/shop/3080/item485421.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890186
97	Sun Pearl	Аромат летние ягоды	77	https://cdn.ibot.by/shop/3080/item485422.webp	Heets kz	\N	t	100	2026-01-14 11:47:56.890187
98	Starling Pearl	Со вкусом клубники с базиликом и ментолом	125	https://cdn.ibot.by/shop/3080/item485458-1.webp	Terea kz	\N	t	100	2026-01-14 11:47:56.890188
99	Regullar	Насыщенный табак	70	https://cdn.ibot.by/shop/3080/item1024734.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.890188
100	Regullar Sky	Легкий табак	70	https://cdn.ibot.by/shop/3080/item1024735.webp	FiiT ru/kz	\N	t	100	2026-01-14 11:47:56.890189
101	Tidal Pearl	Это насыщенный вкус поджаренного табака с тонкими древесными нотками и ароматом чая. Одно нажатие активирует капсулу, превращая аромат в освежающий ментоловый вкус. Идеальный выбор для тех, кто предпочитает глубокий табачный аромат с возможностью добавления освежающей ментоловой нотки	135	https://cdn.ibot.by/shop/2777/item1138154.webp	Terea kz	NEW	t	100	2026-01-14 11:47:56.89019
102	Provence Pearl	Насыщенная, поджаренная табачная смесь с солодовыми нотками аромата. Но при открытии капсулы (ароматизатора) к аромату добавляется прохладный виноградный аромат с ментоловыми нотками .	135	https://cdn.ibot.by/shop/2777/item1138155.webp	Terea kz	NEW	t	100	2026-01-14 11:47:56.89019
103	Tropical Swift Parlament	Аромат тропические фрукты	98	https://cdn.ibot.by/shop/3080/item461979.webp	Парламент ru	NEW	t	100	2026-01-14 11:47:56.890191
107	Blue Terea KZ	Чистый ментол	135	https://cdn.ibot.by/shop/2777/item1218880.webp	Terea kz	NEW	t	100	2026-01-14 11:47:56.890193
108	Fragrant Herbs Parlament	Аромат мятные травы	98	https://cdn.ibot.by/shop/3080/item1192837.webp	Парламент ru	NEW	t	100	2026-01-14 11:47:56.890194
109	Fresh Floral Parliament	Аромат цветочная свежесть	95	https://cdn.ibot.by/shop/3080/item1192838.webp	Парламент ru	NEW	t	100	2026-01-14 11:47:56.890194
110	Delicate Citrus Parlament	Аромат цитрус с орехами	95	https://cdn.ibot.by/shop/3080/item1192839.webp	Парламент ru	NEW	t	100	2026-01-14 11:47:56.890195
111	Cameo wave	Тип вкуса: Освежающий табак с ментоловым акцентом\n-Основу составляет мягкий табак среднего крепления, с выраженным охлаждающим эффектом и нотами мяты и эвкалипта,\n\nИмеет чистое, прохладное послевкусие без излишней сладости,\nВ сравнении с другими ментоловыми HEETS — более сбалансированный и свежий, без резкости.\n\nДля кого подойдёт:\nЛюбителям холодных, мятных и освежающих вкусов,\nТем, кто предпочитает легкие стики с чистым ароматом,\n\nОтличная альтернатива сериям HEETS Turquoise или HEETS Green Zing.	98	https://cdn.ibot.by/shop/3080/item1230955.webp	Парламент ru	NEW	t	100	2026-01-14 11:47:56.890196
112	Green Salection	Тип вкуса: Освежающий табак с мятно-травяными нотами\nЛёгкий и чистый табачный вкус с ярко выраженным ментоловым охлаждением.\n\nВ отличие от более сладких вариантов, Green Selection имеет натуральный, свежий аромат без приторности.\n\nВ послевкусии ощущаются травяные и немного цитрусовые ноты, создающие ощущение свежести и чистоты.\n\nОхлаждение умеренное — не слишком сильное, но достаточно выраженное, чтобы придать вкус “чистого дыхания”.\n\nДля кого подойдёт:\nДля любителей мятных или освежающих стиков,\nТем, кто предпочитает лёгкие и свежие вкусы без сладких добавок,\nХорошая альтернатива HEETS Turquoise Selection или HEETS Arctic.	98	https://cdn.ibot.by/shop/3080/item1230956.webp	Парламент ru	NEW	t	100	2026-01-14 11:47:56.890196
113	Teak selection	Тип вкуса: Классический табак с тёплыми древесными нотами\nНасытный, глубокий табачный вкус с древесно-пряными акцентами.\n\nПрисутствует лёгкая ореховая и карамельная мягкость, создающая ощущение благородного, выдержанного табака.\n\nБез ментола и без сладости — чистый, сбалансированный табак с лёгким оттенком дуба и сухофруктов.\nПослевкусие мягкое, слегка терпкое, с благородным “сигарным” характером.\n\nДля кого подойдёт:\nДля тех, кто любит классические табачные вкусы без добавок,\nДля перехода с обычных сигарет на IQOS,\nХорошая альтернатива HEETS Amber или HEETS Bronze.	98	https://cdn.ibot.by/shop/3080/item1230957.webp	Парламент ru	\N	t	100	2026-01-14 11:47:56.890197
115	Siena arm	Табак с древесными и чайными нотками	145	https://cdn.ibot.by/shop/3080/item485448.webp	Terea arm	\N	t	100	2026-01-14 11:47:56.890198
114	HEETS ru — набор с разными ароматами для устройств нагревания табака.	В коробке представлены различные вкусовые варианты по 2 стика каждого вида, удобно упакованные и отсортированные. (всего 2 пачки стиков Heets)\n\nХороший вариант выбрать для себя подходящий вкус	22	https://cdn.ibot.by/shop/2777/item1252244.webp	Парламент ru	NEW	t	100	2026-01-14 11:47:56.890197
66	Iqos LIL SOLID DUAL (зеленый кобальт) + Подарок набор стиков разных вкусов	Двухкомпонентное устройство lil SOLID DUAL, представленное IQOS.\n\nlil SOLID DUAL состоит из двух компонентов: зарядного устройства и держателя. Вы сможете регулировать насыщенность сеанса (2 режима нагревания), а также у устройства есть авто-старт и возможность совершать 2 сеанса подряд*.\n\nДля использования с устройствами lil SOLID специально разработаны стики Fiit и стики HEETS. Мы не гарантируем корректную работу наших устройств при использовании с другими стиками.\n\nХарактеристки:\nТип устройства 2-х компонентное\nРежимы работы устройства. 2 режима: Стандартный, Турбо\nТехнология нагревания. HOLISTIC HEATING PIN\nАвтостарт. Есть\nПоследовательные сеансы 2 сеанса\nВес 97 г - устройство\nЧистка Рекомендуется регулярная чистка после каждой пачки стиков\nДлина сеанса 6 минут или 14 затяжек*	190	https://cdn.ibot.by/shop/2777/item493790-3.webp	IQOS LIL SOLID DUAL	NEW	t	100	2026-01-14 11:47:56.890168
116	Iqos LIL SOLID DUAL (Красаная медь) + Подарок набор стиков разных вкусов	Двухкомпонентное устройство lil SOLID DUAL, представленное IQOS.\n\nlil SOLID DUAL состоит из двух компонентов: зарядного устройства и держателя. Вы сможете регулировать насыщенность сеанса (2 режима нагревания), а также у устройства есть авто-старт и возможность совершать 2 сеанса подряд*.\n\nДля использования с устройствами lil SOLID специально разработаны стики Fiit и стики HEETS. Мы не гарантируем корректную работу наших устройств при использовании с другими стиками.\n\nХарактеристки:\nТип устройства 2-х компонентное\nРежимы работы устройства. 2 режима: Стандартный, Турбо\nТехнология нагревания. HOLISTIC HEATING PIN\nАвтостарт. Есть\nПоследовательные сеансы 2 сеанса\nВес 97 г - устройство\nЧистка Рекомендуется регулярная чистка после каждой пачки стиков\nДлина сеанса 6 минут или 14 затяжек*	190	https://cdn.ibot.by/shop/2777/item1267779.webp	IQOS LIL SOLID DUAL	NEW	t	100	2026-01-14 11:47:56.890199
117	Iqos LIL SOLID DUAL (Черный титан) + Подарок набор стиков разных вкусов	Двухкомпонентное устройство lil SOLID DUAL, представленное IQOS.\n\nlil SOLID DUAL состоит из двух компонентов: зарядного устройства и держателя. Вы сможете регулировать насыщенность сеанса (2 режима нагревания), а также у устройства есть авто-старт и возможность совершать 2 сеанса подряд*.\n\nДля использования с устройствами lil SOLID специально разработаны стики Fiit и стики HEETS. Мы не гарантируем корректную работу наших устройств при использовании с другими стиками.\n\nХарактеристки:\nТип устройства 2-х компонентное\nРежимы работы устройства. 2 режима: Стандартный, Турбо\nТехнология нагревания. HOLISTIC HEATING PIN\nАвтостарт. Есть\nПоследовательные сеансы 2 сеанса\nВес 97 г - устройство\nЧистка Рекомендуется регулярная чистка после каждой пачки стиков\nДлина сеанса 6 минут или 14 затяжек*	190	https://cdn.ibot.by/shop/2777/item1267780.webp	IQOS LIL SOLID DUAL	NEW	t	100	2026-01-14 11:47:56.890199
104	Grееn terea	Табак, цитрусовые, мягкий\nАрмения	145	https://cdn.ibot.by/shop/2777/item1192593.webp	Terea arm	NEW	t	100	2026-01-14 11:47:56.890192
105	Teak terea	Сбалансированная смесь обжаренных табаков со сливочными и ореховыми нотками аромата. \nАрмения	145	https://cdn.ibot.by/shop/2777/item1192832.webp	Terea arm	NEW	t	100	2026-01-14 11:47:56.890192
106	Turquoise terea	свежий ментол, порадуют вас тонкими пряными нотками, подарив освежающее чувство изысканности\nАрмения	145	https://cdn.ibot.by/shop/2777/item1192833.webp	Terea arm	\N	t	100	2026-01-14 11:47:56.890193
118	Iqos LIL SOLID DUAL (белый хром) + Подарок набор стиков разных вкусов	Двухкомпонентное устройство lil SOLID DUAL, представленное IQOS.\n\nlil SOLID DUAL состоит из двух компонентов: зарядного устройства и держателя. Вы сможете регулировать насыщенность сеанса (2 режима нагревания), а также у устройства есть авто-старт и возможность совершать 2 сеанса подряд*.\n\nДля использования с устройствами lil SOLID специально разработаны стики Fiit и стики HEETS. Мы не гарантируем корректную работу наших устройств при использовании с другими стиками.\n\nХарактеристки:\nТип устройства 2-х компонентное\nРежимы работы устройства. 2 режима: Стандартный, Турбо\nТехнология нагревания. HOLISTIC HEATING PIN\nАвтостарт. Есть\nПоследовательные сеансы 2 сеанса\nВес 97 г - устройство\nЧистка Рекомендуется регулярная чистка после каждой пачки стиков\nДлина сеанса 6 минут или 14 затяжек*	190	https://cdn.ibot.by/shop/2777/item1267781.webp	IQOS LIL SOLID DUAL	NEW	t	100	2026-01-14 11:47:56.8902
\.


--
-- Data for Name: saved_addresses; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.saved_addresses (id, user_id, name, delivery_type, address, city, europost_office, is_default, created_at) FROM stdin;
2	1	дом	minsk	ава			f	2026-01-22 16:52:04.808217
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: iqos_shop_user
--

COPY public.users (id, telegram_id, username, first_name, last_name, is_active, created_at, saved_full_name, saved_phone, saved_delivery_address, saved_city, saved_europost_office, saved_delivery_type, bonus_balance, total_orders_count, loyalty_level, role) FROM stdin;
2	279680413	\N	\N	\N	t	2026-01-14 17:20:42.516418	Artem test	291465246	Леакова	\N	\N	minsk	0	0	bronze	admin
3	6837478669	xexehaha1337	k	\N	t	2026-01-26 13:09:59.447028	\N	\N	\N	\N	\N	\N	0	0	bronze	customer
1	576978144	qwnklx	Nikita	\N	t	2026-01-14 11:21:45.893375	морозов никита	+375296934501	якуба коласа	могилев	123	minsk	4.91	7	silver	admin
\.


--
-- Name: bonus_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.bonus_transactions_id_seq', 5, true);


--
-- Name: broadcasts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.broadcasts_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.categories_id_seq', 19, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.favorites_id_seq', 2, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.order_items_id_seq', 14, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.orders_id_seq', 13, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.products_id_seq', 122, true);


--
-- Name: saved_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.saved_addresses_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iqos_shop_user
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: bonus_transactions bonus_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.bonus_transactions
    ADD CONSTRAINT bonus_transactions_pkey PRIMARY KEY (id);


--
-- Name: broadcasts broadcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.broadcasts
    ADD CONSTRAINT broadcasts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: saved_addresses saved_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.saved_addresses
    ADD CONSTRAINT saved_addresses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_saved_addresses_user_id; Type: INDEX; Schema: public; Owner: iqos_shop_user
--

CREATE INDEX idx_saved_addresses_user_id ON public.saved_addresses USING btree (user_id);


--
-- Name: ix_favorites_id; Type: INDEX; Schema: public; Owner: iqos_shop_user
--

CREATE INDEX ix_favorites_id ON public.favorites USING btree (id);


--
-- Name: ix_order_items_id; Type: INDEX; Schema: public; Owner: iqos_shop_user
--

CREATE INDEX ix_order_items_id ON public.order_items USING btree (id);


--
-- Name: ix_orders_id; Type: INDEX; Schema: public; Owner: iqos_shop_user
--

CREATE INDEX ix_orders_id ON public.orders USING btree (id);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: iqos_shop_user
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: iqos_shop_user
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_telegram_id; Type: INDEX; Schema: public; Owner: iqos_shop_user
--

CREATE UNIQUE INDEX ix_users_telegram_id ON public.users USING btree (telegram_id);


--
-- Name: bonus_transactions bonus_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.bonus_transactions
    ADD CONSTRAINT bonus_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: bonus_transactions bonus_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.bonus_transactions
    ADD CONSTRAINT bonus_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: broadcasts broadcasts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.broadcasts
    ADD CONSTRAINT broadcasts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: favorites favorites_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: saved_addresses saved_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iqos_shop_user
--

ALTER TABLE ONLY public.saved_addresses
    ADD CONSTRAINT saved_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO iqos_shop_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO iqos_shop_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO iqos_shop_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO iqos_shop_user;


--
-- PostgreSQL database dump complete
--

\unrestrict lPhQWJJ1VkfOgqmwxOh8UUJxjF9bMqiiQQegbvc6Oe4LExolRyCZE4fYmfnxA7u

