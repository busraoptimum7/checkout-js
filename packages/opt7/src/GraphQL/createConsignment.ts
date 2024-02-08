export const createConsignment = async () => {
    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            body: JSON.stringify({
                query: `
                    mutation addCheckoutShippingConsignments($addCheckoutShippingConsignmentsInput: AddCheckoutShippingConsignmentsInput!) {
                        checkout {
                            addCheckoutShippingConsignments(input: $addCheckoutShippingConsignmentsInput) {
                                checkout {
                                    entityId
                                    shippingConsignments {
                                        entityId
                                        availableShippingOptions {
                                            entityId
                                        }
                                        selectedShippingOption {
                                            entityId
                                        }
                                    }
                                }
                            }
                        }
                    }
                `
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return error;
    }
}
