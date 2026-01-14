# 🔧 Запуск миграции базы данных

## Проблема
Автоматическая миграция падает на Render. Нужно запустить SQL скрипт вручную.

## Решение: Запустить SQL через Render Dashboard

### Шаг 1: Откройте PostgreSQL Shell

1. Зайдите на https://dashboard.render.com
2. Найдите вашу PostgreSQL базу данных (`iqos-shop-db`)
3. Откройте её
4. Нажмите **Shell** (в верхнем меню)

### Шаг 2: Выполните SQL команды

Скопируйте и вставьте эти команды по одной:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_full_name VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_phone VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_delivery_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_city VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_europost_office VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_delivery_type VARCHAR;
```

### Шаг 3: Проверьте что поля добавлены

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'saved_%';
```

Должно показать 6 полей:
- saved_full_name
- saved_phone
- saved_delivery_address
- saved_city
- saved_europost_office
- saved_delivery_type

### Шаг 4: Задеплойте backend

После добавления полей:

```bash
git add -A
git commit -m "Remove migration from startup"
git push origin main
```

Render автоматически задеплоит backend.

## Альтернатива: Через psql (если есть доступ)

Если у вас установлен psql:

```bash
# Получите External Database URL из Render Dashboard
psql "postgresql://user:password@host/database" < backend/migration.sql
```

## Проверка работы

После миграции:

1. Откройте бота в Telegram
2. Оформите заказ (заполните все поля)
3. Вернитесь в корзину и снова нажмите "Оформить заказ"
4. Поля должны автоматически заполниться данными из предыдущего заказа

## Что сохраняется

✅ ФИО
✅ Телефон  
✅ Адрес доставки (для Минска)
✅ Город (для Евро почты)
✅ Отделение (для Евро почты)
✅ Тип доставки

❌ Время доставки (вводится вручную)
❌ Дата доставки (вводится вручную)
❌ Комментарий (вводится вручную)

---

**Файл SQL скрипта**: `backend/migration.sql`
