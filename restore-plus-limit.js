require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRET;

async function queryHasura(query, variables = {}) {
    const response = await fetch(HASURA_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': HASURA_SECRET
        },
        body: JSON.stringify({ query, variables })
    });
    
    const result = await response.json();
    if (result.errors) {
        throw new Error(JSON.stringify(result.errors));
    }
    return result.data;
}

async function restore() {
    const mutation = `
        mutation RestorePlusLimit {
            update_member_types_by_pk(
                pk_columns: { id: "plus" }
                _set: { draw_fish_limit: "10" }
            ) {
                id
                draw_fish_limit
            }
        }
    `;
    
    await queryHasura(mutation);
    console.log('✅ 已恢复 Plus 会员的 draw_fish_limit 为 "10"');
}

restore().catch(console.error);

