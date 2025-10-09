
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {toast} from 'react-toastify';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/CreatePost.css';
export default function CreatePost(){
    
   const [ categories, setCategories ] = useState([]);
   const [ barangays, setBarangays ] = useState([]);
   const [ loading, setLoading ] = useState(false);
   const nav = useNavigate();  

    const [ formData, setFormData ] = useState({
       title:'',
       type:'Lost',
       category_id:'',
       barangay_id:'',
       color:'',
       description:'',
       contact_info:'',
       photo:null
    });
  
    useEffect(()=>{
       const fetchFormData = async()=>{
         try{
           const res = await fetch('http://localhost:8000/api/posts/form-data',{
            credentials:'include'
           });
           if(res.ok){
            const data = await res.json();
            if(data.success){
               setCategories(data.categories);
               setBarangays(data.barangays);
            }else{
               console.error('Failed to fetch form data');
            }
           }
         }catch(error){
            console.error('Error fetching form data:', error);
         }

       };
     
      fetchFormData();
    
   },[]);

    const handleChange = (e) =>{
     const { name, value } = e.target;
     setFormData(prev=>({
      ...prev,
      [name]:value 
     })
   )

    }

   const handleFileChange = (e) => {
    setFormData(prev =>({
         ...prev,
         photo:e.target.files[0]
      }));
   };


   const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.category_id || !formData.barangay_id || !formData.description || !formData.contact_info) {
      toast.error('Please fill in all required fields',{
         position:'top-center',
         autoClose:1000
      });
      return;
    }

    setLoading(true); // Start loadin

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('barangay_id', formData.barangay_id);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contact_info', formData.contact_info);
      
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      const res = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Post created successfully! It is now live on the bulletin board.',{
         position:'top-center',
         autoClose:1000
        });
        // Reset form
        setFormData({
          title: '',
          type: 'Lost',
          category_id: '',
          barangay_id: '',
          color: '',
          description: '',
          contact_info: '',
          photo: null
        });
        // Redirect to bulletin board
        nav('/user');
      } else {
        toast.error('Error creating post: ' + (result.error || 'Unknown error'),{
         position:'top-center',
         autoClose:1000
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error creating post. Please try again.',{
         position:'top-center',
         autoClose:1000
      });
    }finally{
      setLoading(false);
    }
  };





    return(
        <div className="create-container">
            <UserNav/>
           <main className="create-content">
              <div className='create-form-container'> 
                
                <form className='create-post-form' onSubmit={handleSubmit}>
                  <h2 className='create-post-title'>Create a Post</h2>
                     <div className='create-input-group'>
                        <input type='text'
                               name='title'
                               value={formData.title}
                               placeholder='Item/Person Name'
                               onChange={handleChange}
                               />
                     </div>

                  <div className='create-select-container'>
                     <div className='create-select-group'>
                        <select name='type' value={formData.type} onChange={handleChange} >
                           <option value="Lost">Lost</option>
                           <option value="Found">Found</option>
                        </select>
                     </div>

                      <div className='create-select-group'>
                          <select name='category_id' value={formData.category_id} onChange={handleChange} >
                           <option value="">Select Category</option>
                           {
                              categories.map( cat=>(
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))
                           }
                          </select>
                     </div>
                     <div className='create-select-group'>
                          <select name='barangay_id' value={formData.barangay_id} onChange={handleChange}>
                           <option value="">Select Barangay</option>
                           {
                              barangays.map(brgy =>(
                                 <option key={brgy.id} value={brgy.id}>{brgy.name}</option>
                              ))
                           }
                          </select>
                     </div>
                  </div>
                     <div  className='create-input-group'>
                        <input type='text'
                               name='color'
                               placeholder='Color (optional)'
                               value={formData.color}
                               onChange={handleChange}
                               />
                     </div>
                     <div className='create-textarea-group'>
                        <textarea name='description'
                                  rows={4}
                                  placeholder='Additional details (description, identifying features, etc.) *'
                                  value={formData.description}
                                  onChange={handleChange}
                                  >
                                  </textarea>
                     </div>
                      <div className='create-textarea-group'>
                        <textarea name='contact_info'
                                  rows={4}
                                  placeholder='How can people reach you? (e.g.,Call me:09877666677, Email: example@example.com)'
                                  value={formData.contact_info}
                                  onChange={handleChange}
                                  >

                                  </textarea>
                     </div>
                     <div className='image-uploader-container'>
                        <label>Upload Photo (optional):</label>
                        <input type='file'
                               name='image'
                               accept='image/*'
                               onChange={handleFileChange}
                               />
                     </div>
                     <button className='submit-post-btn' type='submit'>
                        {loading ? 'Submitting...' : 'Submit Post'}
                     </button>
                </form>

              </div>

           </main>

        </div>
    )
}