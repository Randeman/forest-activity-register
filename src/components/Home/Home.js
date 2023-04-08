import { useEffect } from 'react';
import {  Link } from 'react-router-dom';
import "./homePage.css"
import * as commentService from '../../services/commentService';

export const Home = ({activities}) => {



    return (
        <>
            <section className="welcome-content">
                <article className="welcome-content-text">
                    <h1>Because We Care</h1>
                    <p>We promotes responsible forestry as a means of sustaining the integrity of forest ecosystems and the human communities dependent upon them. </p>
<p>Our vision is the forest first and that mean: A balanced view. Rather than wilderness views vs economic development, we focus on solutions with a balanced approach to forest management. Most forest land must support ecological as well as human economic needs. We acknowledge and consider all of these needs in the policies we support and the forest management we do, recommend, and teach on the ground.</p>

<p>We will always have more to learn from forests, so we keep listening, watching, researching and sharing knowledge. </p>
                </article>
                <article className="welcome-content-image">
                    <img src="https://rfs.org.uk/wp-content/uploads/2022/08/Results-day-imagery-e1660459837482.png" alt="workcrew" />
                    <img src="https://www.greenpeace.org/static/planet4-international-stateless/2020/06/8947c272-gp0sttq96.jpg" alt="workcrew" />
                    <button id='link'>
                            <Link to={"/activities"} style={{ textDecoration: "none", color: "white" }}>Join us</Link>
                        </button>
                </article>
            </section>
            <section className='last'>
                <h3>Last activities</h3>
                {!activities.length && <h5>"NO ACTIVITIES YET ..."</h5>}    
            {!!activities.length && activities.sort((a, b) => a._createdOn - b.createdOn)
            .slice(0, 3)
            .map(x => 
                <article key={x._id} className='sorted'>
                    <h5>{x.category}</h5>
                    <label>Place</label>
                    <p>{x.district}, {x.municipality}, {x.land}</p>
                    <label>Start</label>
                    <p>{x.start?.replace("T", ", ").slice(0, 17)}</p>
                    <button id='link'>
                            <Link to={`/activities/${x._id}`} style={{ textDecoration: "none", color: "white" }}>View details</Link>
                        </button>
                </article>
            )}
            </section>
            {/* <section className='most-comment'>
                <h3>Most comment activities</h3><p></p>
                {(!activities.length || !activities.filter(x => !!onCommentLoad(x._id).length) && <h5>"NO ACTIVITIES OR NO COMMENTS YET ..."</h5>}   
            {!!activities.length && activities.filter(x => !!onCommentLoad(x._id).length > 0)
            .sort((a, b) => b.comments.length - a.comments.length)
            .slice(0, 3)
            .map(x => 
                <article className='sorted'>
                    <h5>{x.category}</h5>
                    <label>Place</label>
                    <p>{x.district}, {x.municipality}, {x.land}</p>
                    <label>Last comment</label>
                    <p>{x.comments}</p>
                    <button id='link'>
                            <Link to={`/activities/${x._id}`} style={{ textDecoration: "none", color: "white" }}>View details</Link>
                        </button>
                </article>
            )}
            </section> */}
        </>
    )
}