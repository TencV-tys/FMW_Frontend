


import UserNav from '../UserComponents/UserDashboardNav'
export default function CreatePost(){



    return(
        <div className="create-container">
            <UserNav/>
           <main className="create-content">
             <h2>Create a Post</h2>
              <div className='create-form-container'>
                 
                <form className='create-post-form'>
                     <div className='create-input-group'>
                        <input type='text'
                               name='name'
                               placeholder='Item/Person Name'
                               required
                               />
                     </div>
                     <div className='create-input-group'>
                        <select name='type' >
                           <option value="lost">Lost</option>
                           <option value="found">Found</option>
                        </select>
                     </div>
                     <div className='create-input-group'>
                          <select name='barangay_id'>
                           <option value="">Select Barangay</option>
                          </select>
                     </div>
                     <div  className='create-input-group'>
                        <input type='text'
                               name='color'
                               placeholder='Color (optional)'/>
                     </div>
                     <div className='create-input-group'>
                        <textarea name='descripion'
                                  placeholder='Additional details'></textarea>
                     </div>
                     <div className='create-input-group'>
                        <input type='file'
                               name='image'
                               accept='image/*'/>
                     </div>
                     <button type='submit'>Submit Post</button>
                </form>

              </div>

           </main>

        </div>
    )
}