# Overview
Project is based on:
- **React Router v7**. Use the quick reference below.
- **Supabase**
- **Docker**

# Folder structure
/docker: Dockerfile and docker-compose.yml
/app: React app
/sql: SQL files for Supabase

# VERY IMPORTANT RULES
- Prefer SSR over CSR
- DO NOT USE '@tabler/icons-react' ! When you need icons, use 'lucide-react' and not '@tabler/icons-react'. 
- DO NOT import { json } from "react-router-dom";. For JSON, use this format: new Response(JSON.stringify(...)}
- DO NOT use 'createStyles' from '@mantine/core'

# Quick reference for React Router v7

## Data loading
In React Router framework mode, data is supplied to route components via loader and clientLoader functions. 


### client-side data loading: use clientLoader

```
export async function clientLoader(params) {
  const res = await fetch(`/api/products/${params.pid}`);
  const product = await res.json();
  return product;
}
```

This function fetches product data from the /api/products/:pid endpoint based on route parameters. ​


### server-side data loading: use loader

```javascript
export async function loader(params) {
  const product = await fakeDb.getProduct(params.pid);
  return product;
}

export default function Product( loaderData) {
  const { name, description } = loaderData;
  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```


## Actions
Actions are functions associated with routes that handle data mutations, such as form submissions. Defining an action for a route enables the application to process incoming data and update the UI accordingly. There are two types of actions: client actions and server actions.

### Client Actions

Client actions run exclusively in the browser and take precedence over server actions when both are defined. They are useful for handling data mutations without involving server-side processing.​
React Router

Here's an example of a client action:


### Server Actions

Server actions run exclusively on the server and are omitted from client bundles, making them suitable for handling sensitive operations or when direct server interaction is required.​
React Router

Here's an example of a server action:

```javascript
// route('/projects/:projectId', './project.js')
import { Form } from "react-router";
import { fakeDb } from "../db";

export async function action({ request, params }) {
  let formData = await request.formData();
  let title = formData.get("title");
  let projectId = params.projectId;
  let project = await fakeDb.updateProject(projectId, { title });
  return project;
}

export default function Project({ actionData }) {
  return (
    <div>
      <h1>Project</h1>
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">Submit</button>
      </Form>
      {actionData ? <p>{actionData.title} updated</p> : null}
    </div>
  );
}
```

For server actions, .server.js files are not required.
Do not use '@remix-run/node'



# Supabase
Query data from supabase like this:
```javascript
const supabase = createSSRClient(request, headers);
const { error: updateError } = await supabase
  .from('users')
  .update({ firstname, lastname })
  .eq('email', user.email) ;
  ```

  do not use " .schema('hypnocaments');"


# Funnels
Funnels are defined with a url /funnel/quiz-hypnose/0
this is routed to the file funnel.$funnelId.$stepId.jsx which instantiate a specific component, depending on funnels.json:
- FunnelStep_Page
- FunnelStep_Quiz
- FunnelStep_DoubleOptIn

these components dynamically load data from funnels.json (e.g. for the page, loads the specific jsx page)


# Misc
Do imports like this:
```javascript
import { createSSRClient } from '@/utils/supabase/server'; 
```

not like this

```javascript
import { createSSRClient } from '~/utils/supabase/server'; 
```


