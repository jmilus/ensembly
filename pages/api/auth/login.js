import { supabase } from '../../../utils/supabase-client';

const loginHandler = async ({email, password}) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log({ data }, { error });
    const user = await supabase.auth.getUser()
    console.log({ user });
  }

const login = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await loginHandler(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default login;