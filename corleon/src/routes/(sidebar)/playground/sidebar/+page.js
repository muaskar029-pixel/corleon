export async function load({ fetch }) {
  const query = `
    query GetDigitalAssets {
      digitalAssets {
        nodes {
          id
          databaseId
          title
          date
          slug
          content
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  `;

  const response = await fetch(import.meta.env.VITE_PUBLIC_WORDPRESS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (response.ok) {
    const responseObj = await response.json();
    const assets = responseObj.data?.digitalAssets?.nodes || [];
    return {
      assets,
      errors: responseObj.errors || null
    };
  }

  return { assets: [], errors: null };
}
