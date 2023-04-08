import { useContext } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../contexts/AuthContext";

export const Register = () => {
    const { onRegisterSubmit } = useContext(AuthContext);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({ criteriaMode: 'all' });

    const onSubmit = (data) => {
        console.log(data);
        onRegisterSubmit(data);

    }


    return (
        <section id="register-page" className="content auth">
            <form id="register" method="post" onSubmit={handleSubmit(onSubmit)}>
                <div className="container">
                    <div className="brand-logo"></div>
                    <h1>Register</h1>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        {...register("email", { required: "*Please enter a email." })}
                    />
{errors.email ? <p>{errors.email.message}</p> : <p></p>}
                    <label htmlFor="pass">Password:</label>
                    <input
                        type="password"
                        id="register-password"
                        {...register("password", { required: "*Please enter a password.", 
                        minLength: {value: 3, message: "*Your password must be at least 3 characters."}})}
                    />
                    {errors.password ? <p>{errors.password.message}</p> : <p></p>}
                    <label htmlFor="con-pass">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirm-password"
                        {...register("repassword",
                        {
                            required: "*Please confirm the password.",
                            validate: {
                                assertPassword: (v) => {
                                    if (v !== "" && v !== watch("password"))
                                        return "*The password confirmation does not match."

                                    
                                }
                             
                            }
                        })} />
                    {errors.repassword ? <p>{errors.repassword.message}</p> : <p></p>}
                    <input className="btn submit" type="submit" value="Register" />

                    <p className="field">
                        <span>If you already have profile click <Link to="/login">here</Link></span>
                    </p>
                </div>
            </form>
        </section>

    );
};