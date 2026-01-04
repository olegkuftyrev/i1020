# Тестирование аутентификации

## Шаги для тестирования:

1. **Запустить PostgreSQL:**
   ```bash
   npm run db:up
   ```

2. **Выполнить миграции:**
   ```bash
   npm run db:migrate
   ```

3. **Запустить backend:**
   ```bash
   npm run dev --workspace=apps/backend
   ```
   Backend будет доступен на `http://localhost:3333`

## API Endpoints:

### Регистрация
```bash
POST http://localhost:3333/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

### Логин
```bash
POST http://localhost:3333/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Получить текущего пользователя (требует авторизации)
```bash
GET http://localhost:3333/api/auth/me
Cookie: adonis-session=<session-cookie>
```

### Выход (требует авторизации)
```bash
POST http://localhost:3333/api/auth/logout
Cookie: adonis-session=<session-cookie>
```

## Тестирование с curl:

```bash
# Регистрация
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}' \
  -c cookies.txt

# Логин
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Получить текущего пользователя
curl -X GET http://localhost:3333/api/auth/me \
  -b cookies.txt

# Выход
curl -X POST http://localhost:3333/api/auth/logout \
  -b cookies.txt
```

