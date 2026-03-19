# Passo a passo: Domínio + HTTPS para o n8n (Byla)

Guia para colocar o n8n em um endereço com nome (domínio) e cadeado (HTTPS), para o Google OAuth funcionar. Tudo em ordem; cada passo diz **onde** você está (navegador ou servidor).

---

## PARTE 1 – No navegador (domínio e DNS)

### Passo 1 – Escolher o nome
- Exemplo: `n8n.byla.com.br` ou `byla-n8n.com`.
- Anote o nome exato.

### Passo 2 – Comprar o domínio
1. Abra o site de um registrador (ex.: **Reg.br** para .com.br ou **Namecheap** para .com).
2. Pesquise o nome.
3. Compre (cadastro + pagamento).
4. Guarde o login do painel onde você gerencia o domínio.

### Passo 3 – Apontar o domínio para o servidor
1. Entre no painel do domínio (onde você gerencia o DNS).
2. Procure **"DNS"**, **"Zona DNS"** ou **"Manage DNS"**.
3. Clique em **"Adicionar registro"** ou **"Add record"**.
4. Escolha o tipo **A**.
5. Preencha:
   - **Nome:** se for `n8n.seudominio.com`, use só `n8n`. Se for o domínio principal, use `@`.
   - **Valor / Destino / Apontar para:** `165.227.221.64`
6. Salve.
7. Espere de 5 a 30 minutos. Depois teste no navegador: `http://seudominio.com` — deve abrir a tela do n8n (pode aparecer "Não seguro" por enquanto).

---

## PARTE 2 – No servidor (tudo por comandos)

Quem tem a senha da Digital Ocean (Droplet) faz esta parte. No seu PC **não** se baixa Nginx nem Certbot; tudo roda no servidor.

### Passo 4 – Abrir o terminal e entrar no servidor
1. No PC: abra **PowerShell** (Windows) ou **Terminal** (Mac).
2. Digite e pressione Enter:
   ```
   ssh root@165.227.221.64
   ```
3. Quando pedir, digite a **senha** do servidor.
4. Quando aparecer algo como `root@...:~#`, você está **dentro** do servidor. Daqui pra frente os comandos rodam **no servidor**.

### Passo 5 – Atualizar e instalar Nginx e Certbot
Digite um comando, Enter, espere terminar. Depois o próximo.

```
sudo apt update
```

```
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Passo 6 – Criar o arquivo de configuração do Nginx
1. Digite (troque `n8n.seudominio.com` pelo **seu** domínio):
   ```
   sudo nano /etc/nginx/sites-available/n8n
   ```
2. Apague o que estiver lá e cole o texto abaixo.
3. **Troque** `n8n.seudominio.com` pelo seu domínio nas duas linhas que têm esse texto:

```
server {
    listen 80;
    server_name n8n.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. Salvar: **Ctrl+O**, Enter. Sair: **Ctrl+X**.

### Passo 7 – Ativar o site e recarregar o Nginx
Um comando por vez:

```
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
```

```
sudo nginx -t
```

(Se aparecer "syntax is ok", está certo.)

```
sudo systemctl reload nginx
```

### Passo 8 – Pedir o certificado HTTPS (cadeado)
Digite (troque pelo seu domínio):

```
sudo certbot --nginx -d n8n.seudominio.com
```

1. Informe o **e-mail** quando pedir.
2. Aceite os **termos** (Y).
3. Quando terminar, o site já estará com HTTPS.

Teste no navegador: **https://seudominio.com** — deve abrir o n8n com o **cadeado**.

### Passo 9 – Configurar o n8n (domínio + HTTPS)
1. Vá na pasta do n8n (exemplo):
   ```
   cd ~/.n8n
   ```
   (Se o n8n estiver em outra pasta, use essa.)
2. Abra o arquivo de configuração:
   ```
   nano .env
   ```
   (Se usarem `docker-compose.yml` em vez de `.env`, use: `nano docker-compose.yml`.)
3. Adicione estas linhas (troque pelo seu domínio):
   ```
   N8N_HOST=n8n.seudominio.com
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://n8n.seudominio.com/
   ```
4. Salvar: **Ctrl+O**, Enter. Sair: **Ctrl+X**.
5. Reiniciar o n8n. Se for Docker:
   ```
   docker-compose down
   docker-compose up -d
   ```

---

## PARTE 3 – No navegador (Google)

### Passo 10 – Cadastrar a URL no Google
1. Acesse [console.cloud.google.com](https://console.cloud.google.com).
2. Abra o **projeto** que usa o n8n.
3. Menu: **APIs e serviços** → **Credenciais**.
4. Clique na credencial **OAuth 2.0** (tipo "Aplicativo da Web").
5. Em **"URIs de redirecionamento autorizados"**, clique em **+ ADICIONAR URI**.
6. Cole (troque pelo seu domínio):
   ```
   https://n8n.seudominio.com/rest/oauth2-credential/callback
   ```
7. Salve.

### Passo 11 – Testar
1. No navegador, abra **https://seudominio.com** (com cadeado).
2. No n8n, vá na credencial do Google e clique em **Conectar** ou **Reautorizar**.
3. Faça login no Google e autorize. Deve voltar para o n8n e a conexão ficar ok.

---

## Resumo

| Parte | Onde | O que faz |
|-------|------|-----------|
| 1 | Navegador | Comprar domínio e configurar DNS (registro A → 165.227.221.64). |
| 2 | Terminal → servidor | Entrar com SSH, instalar Nginx e Certbot, criar config, rodar Certbot, configurar n8n. Tudo por comandos no servidor. |
| 3 | Navegador | No Google Cloud, adicionar a URL de redirecionamento e testar o login. |

No PC você só usa **navegador** (domínio/DNS e Google) e **terminal** para o SSH. Nginx, Certbot e HTTPS são feitos **só no servidor**, por comandos.
