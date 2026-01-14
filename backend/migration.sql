-- Миграция: добавление полей для автозаполнения формы заказа
-- Запустите этот скрипт в Render Dashboard → PostgreSQL → Shell

-- Добавляем поля для сохранения данных пользователя
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_full_name VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_phone VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_delivery_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_city VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_europost_office VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_delivery_type VARCHAR;

-- Проверка что поля добавлены
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'saved_%';
