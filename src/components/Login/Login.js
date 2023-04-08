import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';

import { useAuthContext } from "../../contexts/AuthContext";
import "./Login.css"

export const Login = () => {
   
    const { onLoginSubmit } = useAuthContext();
    

    const { register, handleSubmit, formState: { errors } } = useForm({ criteriaMode: 'all' });

    const onSubmit = (data) => {
        
        onLoginSubmit(data);

    }


    return (
        <section id="login-page" className="auth" >
            <form id="login" method="post" onSubmit={handleSubmit(onSubmit)}>
                <div className="container">
                    <div className="brand-logo"></div>
                    <h1>Login</h1>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        {...register("email", { required: "*Please enter a email." })}
                    />
                    {errors.email ? <p>{errors.email.message}</p> : <p></p>}
                    <label htmlFor="login-pass">Password:</label>
                    <input
                        type="password"
                        id="login-password"
                        {...register("password", { required: "*Please enter a password.", 
                        minLength: {value: 3, message: "*Your password must be at least 3 characters."}})}
                    />
                     <ErrorMessage
                            errors={errors}
                            name="password"
                            render={({ messages }) =>
                                messages &&
                                Object.entries(messages).map(([type, message]) => (
                                    <p key={type}>{message}</p>
                                ))
                            }
                        />
                        <p></p>
                    <input type="submit" className="btn submit" value="Login" />
                   
                    <p className="field">
                        <span>If you don't have profile click <Link to="/register">here</Link></span>
                    </p>
                </div>
            </form>
        </section>
    );
}

