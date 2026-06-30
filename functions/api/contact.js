export async function onRequestGet() {
    return new Response(
        JSON.stringify({
            success: true,
            message: 'Contact endpoint is available. Send a POST request to submit the form.'
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

export async function onRequestPost(context) {
    const { request } = context;
    let data = {};

    try {
        data = await request.json();
    } catch (error) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
    }

    return new Response(
        JSON.stringify({
            success: true,
            message: 'Contact request received.',
            data
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}
