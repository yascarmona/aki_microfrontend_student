# AKI! Microfrontend do Estudante

Aplicação mobile-first em React + TypeScript para registro de presença via leitura de QR Code.

## 👩‍🎓 Alunos
Camila Delarosa  
Dimitri Delinski  
Guilherme Belo  
Yasmin Carmona

## Funcionalidades
- Registro do dispositivo (associa CPF ao device). 
- Leitura de QR Code para presença. 
- Suporte offline (fila e sincronização posterior). 
- Geolocalização para verificação. 
- Feedback em tempo real (sucesso/erro). 
- UI otimizada para toque.
 - Fluxo inteligente de primeira presença: redireciona para confirmação de CPF.

## 🧱 Arquitetura do Código-Fonte
Baseada em um mix de Clean Architecture, SOLID e Vertical Slice para separar domínios e permitir evolução rápida sem regressões globais.
```
src/
  app/        # Bootstrapping: rotas, providers globais, estilos
  features/   # Slices: device, attendance (fluxo presença), scan (histórico/QR)
  shared/     # UI genérica, hooks, tipos, utils SIEMPRE reutilizáveis
  services/   # Infraestrutura: http (axios), storage, geolocation, queue
  stores/     # Zustand stores isoladas por domínio
  lib/        # Funções puras utilitárias (ex: format, validação)
```
Fluxo de dados:
Componente → Hook (regra de interação) → Serviço (`services/*`) → API → Normalização → Store / Toast.

**Princípios aplicados:**
- SRP: cada arquivo tem propósito único (ex: `useScanSubmit` só lida com envio de scan).
- Encapsulamento de domínio: nada externo importa internals de outra slice.
- Dependência unidirecional (UI → serviços), nunca serviços dependendo de UI.
- Edge cases documentados dentro dos hooks (offline, duplicado, placeholder de URL).

**Motivações:**
- Vertical Slice reduz impacto de mudanças futuras em presença sem tocar scan/device.
- Runtime env (env.js) remove necessidade de rebuild quando a URL do BFF muda.
- Hooks isolam efeitos colaterais permitindo futura migração para React Query sem refator grande.

**Pontos de extensão futuros:**
- Camada de retry/backoff configurável por tipo de erro.
- Testes unitários automatizados para serviços e lib.
- Mecanismo de versão para schema de storage local.

### Fluxo de Presença
1. Estudante abre link ou QR contendo `?token=<qr_token>` gerado pelo microfrontend do professor.
2. Verificação do `DeviceStorage`: se não existe CPF → redireciona para `/attendance/confirm?token=...` para validar e persistir.
3. Submissão inicial registra presença e salva `cpf` e `device_id` (gerado) localmente.
4. Próximas presenças com o mesmo device fazem auto-submissão sem exibir formulário (prevenção de loop por flag interna + localStorage de tokens já enviados).
5. Tokens já utilizados são cacheados (ex: chave `aki_attendance_tokens`) para evitar POST duplicado em refresh repetido.
6. Offline: token e contexto são enfileirados e sincronizados assim que a rede retorna.
7. Placeholder de URL (`${VITE_BFF_BASE_URL}`) é detectado e evita requisição incorreta (fallback absoluto).

## Stack
- React 18 + TS
- Vite (build)
- React Router DOM (rotas)
- Zustand (estado)
- TailwindCSS + shadcn/ui (UI)
- React Hook Form + Zod (forms/validação)
- Axios (HTTP)
- react-qr-reader (QR)
- Sonner (notificações)

## Instalação
```bash
npm install
cp .env.example .env
# ajustar VITE_API_BASE_URL
```

## Desenvolvimento
```bash
npm run dev      # inicia em http://localhost:5173 (porta fixa - ver vite.config.ts)
npm run build    # build produção
npm run preview  # preview build
```

## Docker
```bash
docker build -t aki-student:latest .
docker run -p 5173:80 \
  -e VITE_API_BASE_URL=https://bff.example.com \
  -e VITE_BFF_BASE_URL=https://bff.example.com \
  -e VITE_APP_ENV=production \
  -e VITE_APP_NAME="AKI Student" \
  aki-student:latest
# acessar http://localhost:5173
```

### Fallback de Rotas (SPA)
Em produção, acessar diretamente URLs como `/qr?token=...` gerava **404 (Not Found)** porque o Nginx padrão não redireciona rotas internas para `index.html`.

Para corrigir isso foi adicionado um `nginx.conf` customizado com:
```
location / {
  try_files $uri $uri/ /index.html;
}
```
Isso garante que qualquer rota do React Router (ex: `/qr`, `/attendance/confirm`) seja servida corretamente.

Se você fizer deploy sem esse arquivo, apenas a raiz `/` funcionará e links profundos (deep links) quebrarão.

### Injeção de Variáveis de Ambiente em Runtime
O contêiner gera um arquivo `env.js` na inicialização através do script `docker-entrypoint.sh`.
Esse arquivo define `window.__AKI_ENV__` com as variáveis passadas via `-e`.

Trecho gerado (exemplo):
```js
window.__AKI_ENV__ = {
  VITE_API_BASE_URL: "https://bff.example.com",
  VITE_BFF_BASE_URL: "https://bff.example.com",
  VITE_APP_ENV: "production",
  VITE_APP_NAME: "AKI Student",
};
```

Para consumir no código, prefira:
```ts
const runtime = (window as any).__AKI_ENV__;
const API_BASE = runtime?.VITE_BFF_BASE_URL || import.meta.env.VITE_BFF_BASE_URL;
```

Isso evita problemas ao trocar URLs no Azure sem rebuild da imagem.

## Integração com API (Gateway)
Exemplo registro dispositivo:
```http
POST /students/device
Content-Type: application/json
{
  "cpf": "12345678900",
  "device_id": "device_abc123"
}
```
Exemplo envio leitura:
```http
POST /scan
Content-Type: application/json
{
  "qr_token": "signed_jwt_token",
  "device_id": "device_abc123",
  "location": { "latitude": -23.55, "longitude": -46.63 },
  "device_time": "2024-01-15T10:30:00.000Z"
}
```

## Comportamento Offline
1. Detecta estado de rede. 
2. Salva leituras falhas em storage local. 
3. Sincroniza automaticamente ao voltar online. 
4. Indica pendências ao usuário. 
5. Até 3 tentativas de retry por leitura.

## Segurança
- Device ID armazenado em localStorage com chave configurável. 
- Validação de CPF antes do envio. 
- QR tokens JWT validados no BFF. 
- Permissão de localização solicitada somente quando necessário. 
- Sem dados sensíveis em logs de produção.

## Design
Paleta principal: Amarelo (#FFD700), Marrom (#A0522D), Fundo branco. Princípios: mobile-first, alto contraste, alvos de toque >= 44px, animações suaves e comandos claros.

## Variáveis de Ambiente
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_APP_ENV` | Nome do ambiente | `production` |
| `VITE_API_BASE_URL` | URL base do BFF | `http://localhost:3007` |
| `VITE_BFF_BASE_URL` | Alias usado em hooks (ex: useScanSubmit) | `http://localhost:3007` |
| `VITE_APP_NAME` | Nome da aplicação | `AKI Student` |
| `VITE_DEVICE_STORAGE_KEY` | Chave localStorage device | `aki_student_device` |

## Testes (Futuro)
Estrutura pronta: funções puras em utils, camada HTTP separada, hooks isolam lógica, componentes desacoplados.

## Licença
Uso interno / proprietário AKI!

---
Para mais informações contate o time de desenvolvimento.
