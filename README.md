# Bolão da Copa

Bolão da Copa do Mundo 2026 pra jogar com os amigos. Cada pessoa entra com a conta Google, cria ou entra em um grupo por um link de convite, palpita o placar dos jogos e acompanha o ranking do grupo. Os resultados entram sozinhos conforme os jogos acontecem.

## Como funciona

- Você entra com o Google, sem senha.
- Qualquer um pode criar um grupo (até 5 por pessoa). O grupo gera um link de convite, e também dá pra entrar digitando o código direto na home.
- O dono decide se o grupo fica aberto ou fechado, e pode apagar o grupo. Quem não é dono pode sair quando quiser.
- Dentro do grupo, cada um palpita o placar de cada jogo. O palpite trava no horário de início da partida.
- Os jogos ficam separados em abertos e encerrados. Nos encerrados aparece o placar oficial junto do seu palpite.
- Se você está em mais de um grupo, dá pra copiar seus palpites de um grupo pro outro de uma vez.
- Os palpites dos outros só aparecem depois que o jogo começa.
- O ranking e a lista de participantes ficam na própria página do grupo, em abas. Quando um jogo termina, a pontuação é calculada e o ranking se atualiza.

Pontuação:

- Placar exato: 3 pontos
- Acertou só o resultado (quem ganhou ou empate): 1 ponto
- Errou: 0

Os valores ficam em `lib/scoring.ts`, dá pra mudar.

## Tecnologias

- Next.js (App Router) e TypeScript
- Tailwind CSS
- Supabase (Postgres e login com Google)
- Deploy na Vercel
- Jogos e resultados vindos do projeto openfootball (`worldcup.json`)
- GitHub Actions pra atualizar os resultados sozinho

## Rodando localmente

Precisa de Node 18.18 ou superior.

1. Instale as dependências:
```bash
   npm install
```
2. Crie um projeto no Supabase e rode o SQL das tabelas no SQL Editor (veja a seção Banco de dados).
3. No Supabase, em Authentication > Providers, ative o Google e preencha o Client ID e o Secret (criados no Google Cloud Console). Em Authentication > URL Configuration, defina a Site URL e adicione `http://localhost:3000/**` nas Redirect URLs.
4. Crie um arquivo `.env.local` na raiz (veja a seção Variáveis de ambiente).
5. Rode:
```bash
   npm run dev
```
6. Abra http://localhost:3000, entre com o Google e importe os jogos uma vez abrindo http://localhost:3000/api/import.

## Variáveis de ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

- As duas primeiras vêm de Settings > API no Supabase (a URL e a chave pública).
- A `SUPABASE_SERVICE_ROLE_KEY` é a chave secreta (mesmo lugar). Ela só roda no servidor e nunca vai pro navegador.
- O `CRON_SECRET` é qualquer string aleatória. Serve pra proteger a rota que importa os resultados.

Não coloque os valores reais no repositório. Em produção, essas mesmas variáveis vão no painel da Vercel, em Settings > Environment Variables, porque o `.env.local` não vai pro Git.

## Banco de dados

São cinco tabelas no Supabase:

- `profiles`: um registro por usuário, com o nome de exibição. Criado automaticamente no primeiro login.
- `groups`: os bolões. Guarda nome, código de convite, se está aberto ou fechado, e quem é o dono.
- `group_members`: quem participa de cada grupo.
- `matches`: os jogos da Copa (times, horário, placar, situação). Iguais pra todos os grupos.
- `predictions`: os palpites, ligados a grupo, jogador e jogo.

A leitura dos jogos é liberada pra quem está logado. As tabelas de grupos e palpites são acessadas só pelo servidor (as rotas em `app/api`), que confere quem é o usuário e o que ele pode fazer antes de gravar.

## Jogos e resultados

Os jogos vêm do `worldcup.json` do openfootball, que é aberto e não precisa de chave de API. A rota `app/api/import` baixa esse arquivo e grava ou atualiza os jogos no banco. Rodar de novo atualiza o placar dos jogos que já aconteceram.

Pra não fazer isso na mão, tem um GitHub Action em `.github/workflows/import.yml` que chama essa rota a cada 30 minutos. Ele manda o `CRON_SECRET` no cabeçalho, e a rota em produção só aceita se o segredo bater.

O placar do openfootball pode demorar um pouco depois do apito final. Se precisar acertar na hora, dá pra editar o `home_score`, o `away_score` e o `status` direto na tabela `matches` no Supabase.

## Deploy

O deploy é na Vercel, ligada ao repositório. Cada push na branch `main` publica a produção.

Pra funcionar em produção:

- Coloque as quatro variáveis de ambiente no painel da Vercel.
- No Supabase, adicione a URL de produção (`https://seu-app.vercel.app/**`) nas Redirect URLs.
- No `.github/workflows/import.yml`, use a URL de produção na chamada do `curl`.
- Crie o secret `CRON_SECRET` no GitHub, em Settings > Secrets and variables > Actions, com o mesmo valor da Vercel.

## Estrutura

```
app/          telas e rotas (home, grupos, palpites, ranking) e as rotas de API
components/   componentes de tela (formulários, botões, listas)
lib/          conexão com o Supabase, importação dos jogos, pontuação e helpers
public/       ícones e service worker do PWA
.github/      o Action que atualiza os resultados
```