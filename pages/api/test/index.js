const testHandler = (data) => {
    console.log("test data:", data)
    return data;
}


const testAPI = async (req, res) => {

    let response = [];
    try {
        response = testHandler(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'test failed', err });
    }
}

export default testAPI;