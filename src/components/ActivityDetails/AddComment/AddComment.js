import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';

export const AddComment = ({
    onCommentSubmit,
}) => {

    const {
        register,
        handleSubmit,
        formState:{errors}
        } = useForm({ criteriaMode: "all" });

        const onSubmit = (data, e) => {
            e.preventDefault();
            onCommentSubmit(data);
            
            
        }

    return (
        <article className="create-comment" >
            <label>Add new comment:</label>
            <form  className="form" method="post" onSubmit={handleSubmit(onSubmit)}>
                <div style={{width: "100%"}}>
                <textarea name="comment"rows="3" style={{ width: "30%" }} placeholder="Comment......" 
                {...register("comment", { required: "*Please enter a comment.", maxLength: { value: 400, message: "Your description is more than 400 characters." }})} ></textarea>
                <ErrorMessage
                    errors={errors}
                    name="comment"
                    render={({ messages }) =>
                        messages &&
                        Object.entries(messages).map(([type, message]) => (
                            <span key={type}>{message}</span>
                        ))
                    }
                />
                </div>
                <input className="btn submit" type="submit" style={{ width: "15%", marginBottom: "70px" }} value="Add Comment" />
            </form>
                
        </article>
    );
};