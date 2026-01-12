# Projeto-CRUD
# 🛡️ Sistema de Autenticação Seguro (Secure Auth)

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?style=for-the-badge&logo=fastapi)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> Um sistema Fullstack de autenticação focado em segurança, mitigação de vulnerabilidades (XSS, Brute Force) e boas práticas de UI/UX.

---

## 🚀 Funcionalidades

- **Autenticação Completa:** Login, Registro e "Logout".
- **Segurança no Backend:**
  - Hash de senhas com **Bcrypt** (ninguém vê a senha real).
  - Prevenção contra **SQL Injection** via SQLAlchemy.
- **Segurança no Frontend:**
  - Mitigação de **XSS** (Sanitização de inputs).
  - Proteção contra **Força Bruta** (Bloqueio temporário após 3 erros).
  - **CAPTCHA** matemático simples para evitar bots.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python** & **FastAPI**: Para uma API rápida e moderna.
- **SQLAlchemy**: ORM para gerenciamento seguro do banco de dados SQLite.
- **Pydantic**: Validação rigorosa de dados.

### Frontend
- **HTML5 & CSS3**: Design limpo e responsivo (Mobile-first).
- **JavaScript (Vanilla)**: Lógica de cliente e conexão via Fetch API.

---

## 📦 Como rodar o projeto

### Pré-requisitos
- Python instalado.
- Git instalado.

### 1. Clonar o repositório
```bash
git clone [https://github.com/JãozimHG/Projeto-CRUD.git](https://github.com/JãozimHG/Projeto-CRUD.git)
cd Projeto-CRUD
