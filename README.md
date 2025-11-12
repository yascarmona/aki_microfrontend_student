# AKI! Microfrontend do Estudante

Aplicação mobile-first em React + TypeScript para registro de presença via leitura de QR Code.

## Funcionalidades
- Registro do dispositivo (associa CPF ao device). 
- Leitura de QR Code para presença. 
- Suporte offline (fila e sincronização posterior). 
- Geolocalização para verificação. 
- Feedback em tempo real (sucesso/erro). 
- UI otimizada para toque.

## Arquitetura
Baseada em princípios de Clean Architecture / SOLID / Vertical Slice.
```
src/
  app/        # Configuração global (rotas, store)
  features/   # Slices: device, scan, presence
  shared/     # Componentes, hooks, tipos, utils reutilizáveis
  services/   # Integrações externas (http, storage)
```
Fluxo principal: UI -> hooks/estado (Zustand) -> serviço HTTP (Axios) -> API Gateway -> resposta -> atualização de store / notificação.

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
npm run dev      # servidor dev
npm run build    # build produção
npm run preview  # preview build
```

## Docker
```bash
docker build -t aki-student:latest .
docker run -p 8080:80 aki-student:latest
# acessar http://localhost:8080
```

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
| `VITE_API_BASE_URL` | URL base do BFF | `https://api.aki.com/v1` |
| `VITE_APP_NAME` | Nome da aplicação | `AKI Student` |
| `VITE_DEVICE_STORAGE_KEY` | Chave localStorage device | `aki_student_device` |

## Testes (Futuro)
Estrutura pronta: funções puras em utils, camada HTTP separada, hooks isolam lógica, componentes desacoplados.

## Autores
Camila Delarosa  
Dimitri Delinski  
Guilherme Belo  
Yasmin Carmona

## Licença
Uso interno / proprietário AKI!

---
Para mais informações contate o time de desenvolvimento.
