# Миграция PostgreSQL: Render → Supabase

## ✅ Статус: ЗАВЕРШЕНО (30 января 2026)

## Что было сделано

### 1. Создан проект в Supabase
- **Название**: iqos-shop-db
- **Регион**: Frankfurt (EU West)
- **План**: Free (500 MB, неограниченные запросы)
- **Connection**: Session pooler для стабильности

### 2. Экспортированы данные из Render
```bash
pg_dump "postgresql://iqos_shop_user:***@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop" > backup_render.sql
```

**Экспортировано:**
- 5 bonus_transactions
- 15 categories
- 14 orders
- 13 order_items
- 118 products
- 1 saved_addresses
- 3 users (включая админов)
- 0 broadcasts

### 3. Импортированы данные в Supabase
```bash
psql "postgresql://postgres.nvrchvvjcsyakrwmijep:***@aws-1-eu-west-1.pooler.supabase.com:5432/postgres" < backup_render.sql
```

### 4. Обновлены переменные окружения

**Backend (Render):**
```
DATABASE_URL=postgresql://postgres.nvrchvvjcsyakrwmijep:dm7YC_Z%25Ur_%409Lx@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Локально (backend/.env):**
```
DATABASE_URL=postgresql://postgres.nvrchvvjcsyakrwmijep:dm7YC_Z%25Ur_%409Lx@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### 5. Проверка работоспособности
- ✅ Backend успешно подключается к Supabase
- ✅ API endpoints работают корректно
- ✅ Данные загружаются без ошибок

## Преимущества Supabase

### Бесплатный план навсегда
- ❌ Render: 30 дней бесплатно, потом $7/месяц
- ✅ Supabase: бесплатно навсегда (500 MB)

### Производительность
- ✅ Меньше cold starts
- ✅ Connection pooling из коробки
- ✅ Автоматические бэкапы (7 дней)

### Удобство
- ✅ Удобный Dashboard с SQL Editor
- ✅ Table Editor для просмотра данных
- ✅ Встроенный мониторинг
- ✅ Уже используется для хранения изображений

## Важные моменты

### Про "засыпание" базы
- База "засыпает" после 7 дней **полной** неактивности
- У вас бот работает 24/7 → база **никогда не заснет**
- Даже если заснет, первый запрос разбудит её за 1-2 секунды

### Кодирование пароля в URL
Пароль содержит специальные символы, поэтому нужно URL-кодирование:
- `%` → `%25`
- `@` → `%40`

**Правильно:**
```
postgresql://postgres.nvrchvvjcsyakrwmijep:dm7YC_Z%25Ur_%409Lx@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Неправильно:**
```
postgresql://postgres.nvrchvvjcsyakrwmijep:dm7YC_Z%Ur_@9Lx@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### Старая база на Render
- Можно удалить через 1-2 дня после проверки
- Backup файл `backup_render.sql` сохранен локально
- Render Dashboard → PostgreSQL → Settings → Delete Database

## Проверка после миграции

### 1. Backend API
```bash
curl https://iqos-backend.onrender.com/api/categories
curl https://iqos-backend.onrender.com/api/products
```

### 2. Админ панель
- Открыть https://admin-frontend-phi-seven.vercel.app
- Проверить загрузку товаров, заказов, клиентов
- Проверить статистику

### 3. Telegram бот
- Открыть бот
- Проверить каталог товаров
- Попробовать сделать тестовый заказ

### 4. Supabase Dashboard
- Зайти на https://supabase.com
- Открыть проект iqos-shop-db
- Table Editor → проверить что данные на месте

## Контакты и доступы

### Supabase
- **URL**: https://supabase.com/dashboard/project/nvrchvvjcsyakrwmijep
- **Project ID**: nvrchvvjcsyakrwmijep
- **Region**: Frankfurt (EU West)
- **Password**: dm7YC_Z%Ur_@9Lx

### Render
- **Backend**: https://iqos-backend.onrender.com
- **Bot**: iqos-telegram-bot (Background Worker)

### Vercel
- **Frontend**: https://iqos-shop.vercel.app
- **Admin**: https://admin-frontend-phi-seven.vercel.app

## Время миграции

- **Начало**: 30 января 2026, 11:00
- **Завершение**: 30 января 2026, 11:25
- **Downtime**: ~2 минуты (перезапуск backend на Render)
- **Общее время**: 25 минут

## Результат

✅ Миграция завершена успешно  
✅ Все данные перенесены  
✅ Система работает стабильно  
✅ Экономия: $7/месяц (Render PostgreSQL больше не нужен)
