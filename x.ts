import { randomBytes } from 'crypto';

import { create as createClient } from '@web3-storage/w3up-client';

type Client = Awaited<ReturnType<typeof createClient>>;

export const W3UP_SPACE_NAME = 'assets.nimi.page';
export const W3UP_CLIENT_EMAIL = 'vasko_10@hotmail.com';

async function main() {
  const client = await createClient({});

  await register(client);

  const bytes = await randomBytes(128);
  const file = new Blob([bytes]);

  try {
    const successMessage = await client.uploadFile(file);
    console.log(successMessage);
  } catch (err) {
    console.log('err', err);
  }
}

main();

async function register(client: Client) {
  const space = await client.createSpace('my-awesome-space');
  await client.setCurrentSpace(space.did());
  await client.registerSpace(W3UP_CLIENT_EMAIL);
}
