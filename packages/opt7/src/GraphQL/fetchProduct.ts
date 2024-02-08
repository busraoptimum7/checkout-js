export const getFFLProducts = (productList: any[], bearer: string) => {
  let myHeaders = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${bearer}`
  });

  const fetchData = fetch('/graphql', {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      query: `
                query MyFirstQuery {
                    site {
                        settings {
                            storeName
                            storeHash
                            logo {
                                title
                            }
                        }
                        products (entityIds: ${JSON.stringify(productList)}) {
                            edges {
                                node {
                                    id
                                    description
                                    name
                                    sku
                                    entityId
                                    defaultImage {
                                        urlOriginal
                                    }
                                    customFields {
                                        edges {
                                            node {
                                                name
                                                value
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `
    })
  }).then(response => { return response.json() }).catch(err => { return err });

  return fetchData;
}
