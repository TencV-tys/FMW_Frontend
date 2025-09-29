


import UserNav from '../UserComponents/UserDashboardNav';
import './styles/CreatePost.css';
export default function CreatePost(){



    return(
        <div className="create-container">
            <UserNav/>
           <main className="create-content">
              <div className='create-form-container'> 
                
                <form className='create-post-form'>
                  <h2>Create a Post</h2>
                     <div className='create-input-group'>
                        <input type='text'
                               name='name'
                               placeholder='Item/Person Name'
                               required
                               />
                     </div>
                  <div className='create-select-container'>
                     <div className='create-select-group'>
                        <select name='type' >
                           <option value="lost">Lost</option>
                           <option value="found">Found</option>
                        </select>
                     </div>
                      <div className='create-select-group'>
                          <select name='category_id'>
                           <option value="">Select Category</option>
                          </select>
                     </div>
                     <div className='create-select-group'>
                          <select name='barangay_id'>
                           <option value="">Select Barangay</option>
                          </select>
                     </div>
                  </div>
                     <div  className='create-input-group'>
                        <input type='text'
                               name='color'
                               placeholder='Color (optional)'/>
                     </div>
                     <div className='create-textarea-group'>
                        <textarea name='description'
                                  rows={4}
                                  placeholder='Additional details'>
                                  </textarea>
                     </div>
                      <div className='create-textarea-group'>
                        <textarea name='contact_info'
                                  rows={4}
                                  placeholder='How can people reach you? (e.g.,Call me:09877666677, Email: example@example.com)'
                                  ></textarea>
                     </div>
                     <div className='image-uploader-container'>
                        <input type='file'
                               name='image'
                               accept='image/*'/>
                     </div>
                     <button className='submit-post-btn' type='submit'>Submit Post</button>
                </form>

              </div>

           </main>

        </div>
    )
}