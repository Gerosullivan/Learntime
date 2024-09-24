# Learntime

Master faster.

## Official Hosted Version

Use Learntime without having to host it yourself!

Find the official hosted version of Learntime [here](https://learntime.ai).

## Technical issues

Please report technical issues in the Issues tab above.

## Feature Requests / Ideas

For non-technical ideas and bugs, please participate in the Bugs + Ideas board [here](https://learntime.canny.io/).

## Updating

In your terminal at the root of your local Learntime repository, run:

```bash
pnpm run update
```

If you run a hosted instance you'll also need to run:

```bash
pnpm run db-push
```

to apply the latest migrations to your live database.

## Local Quickstart

Follow these steps to get your own Learntime instance running locally.

### 1. Clone the Repo

```bash
git clone https://github.com/Gerosullivan/learntime
```

### 2. Install Dependencies

Open a terminal in the root directory of your local Learntime repository and run:

```bash
pnpm install
```

### 3. Install Supabase & Run Locally

#### 1. Install Docker

You will need to install Docker to run Supabase locally. You can download it [here](https://docs.docker.com/get-docker) for free.

#### 2. Install Supabase CLI

**MacOS/Linux**

```bash
brew install supabase/tap/supabase
```

**Windows**

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### 3. Start Supabase

In your terminal at the root of your local Learntime repository, run:

```bash
supabase start
```

### 4. Fill in Secrets

#### 1. Environment Variables

In your terminal at the root of your local Learntime repository, run:

```bash
cp .env.local.example .env.local
```

Get the required values by running:

```bash
supabase status
```

Note: Use `API URL` from `supabase status` for `NEXT_PUBLIC_SUPABASE_URL`

Now go to your `.env.local` file and fill in the values.

If the environment variable is set, it will disable the input in the user settings.

#### 2. SQL Setup

In the 1st migration file `supabase/migrations/20240108234540_setup.sql` you will need to replace 2 values with the values you got above:

- `project_url` (line 53): (default) can remain unchanged if you don't change your `project_id` in the `config.toml` file
- `service_role_key` (line 54): You got this value from running `supabase status`

This prevents issues with storage files not being deleted properly.

### 6. Run app locally

In your terminal at the root of your local Learntime repository, run:

```bash
pnpm run chat
```

Your local instance of Learntime should now be running at [http://localhost:3000](http://localhost:3000). Be sure to use a compatible node version (i.e. v18).

You can view your backend GUI at [http://localhost:54323/project/default/editor](http://localhost:54323/project/default/editor).

## Hosted Quickstart

Follow these steps to get your own Learntime instance running in the cloud.

### 1. Follow Local Quickstart

Repeat steps 1-4 in "Local Quickstart" above.

You will want separate repositories for your local and hosted instances.

Create a new repository for your hosted instance of Learntime on GitHub and push your code to it.

### 2. Setup Backend with Supabase

#### 1. Create a new project

Go to [Supabase](https://supabase.com/) and create a new project.

#### 2. Get Project Values

Once you are in the project dashboard, click on the "Project Settings" icon tab on the far bottom left.

Here you will get the values for the following environment variables:

- `Project Ref`: Found in "General settings" as "Reference ID"

- `Project ID`: Found in the URL of your project dashboard (Ex: https://supabase.com/dashboard/project/<YOUR_PROJECT_ID>/settings/general)

While still in "Settings" click on the "API" text tab on the left.

Here you will get the values for the following environment variables:

- `Project URL`: Found in "API Settings" as "Project URL"

- `Anon key`: Found in "Project API keys" as "anon public"

- `Service role key`: Found in "Project API keys" as "service_role" (Reminder: Treat this like a password!)

#### 3. Configure Auth

Next, click on the "Authentication" icon tab on the far left.

In the text tabs, click on "Providers" and make sure "Email" is enabled.

We recommend turning off "Confirm email" for your own personal instance.

#### 4. Connect to Hosted DB

Open up your repository for your hosted instance of Learntime.

In the 1st migration file `supabase/migrations/20240108234540_setup.sql` you will need to replace 2 values with the values you got above:

- `project_url` (line 53): Use the `Project URL` value from above
- `service_role_key` (line 54): Use the `Service role key` value from above

Now, open a terminal in the root directory of your local Learntime repository. We will execute a few commands here.

Login to Supabase by running:

```bash
supabase login
```

Next, link your project by running the following command with the "Project ID" you got above:

```bash
supabase link --project-ref <project-id>
```

Your project should now be linked.

Finally, push your database to Supabase by running:

```bash
supabase db push
```

Your hosted database should now be set up!

### 3. Setup Frontend with Vercel

Go to [Vercel](https://vercel.com/) and create a new project.

In the setup page, import your GitHub repository for your hosted instance of Learntime. Within the project Settings, in the "Build & Development Settings" section, switch Framework Preset to "Next.js".

In environment variables, add the following from the values you got above:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

You can also add OpenAI API keys as environment variables: `OPENAI_API_KEY`

For the full list of environment variables, refer to the '.env.local.example' file. If the environment variables are set for API keys, it will disable the input in the user settings.

Click "Deploy" and wait for your frontend to deploy.

Once deployed, you should be able to use your hosted instance of Learntime via the URL Vercel gives you.

## Testing: How to run Playwright

View instructions [here](https://playwright.dev/docs/running-tests).

For authentication, run:

```bash
npx playwright codegen github.com/microsoft/playwright --save-storage=auth.json
```

Then run:

```bash
npx playwright codegen --load-storage=auth.json localhost:3000
```

## Contact

Message me on [Twitter/X](https://x.com/gerosullivan)

## Thanks

Thanks to [Mckay Wrigley](https://twitter.com/mckaywrigley) for ChatBotUI - the original repo Learntime was based on. You can find it [here](https://github.com/mckaywrigley/chatbot-ui).
