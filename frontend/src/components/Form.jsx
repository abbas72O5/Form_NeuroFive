import { useState, useRef } from 'react';

const Form = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    dob: '',
    bio: ''
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear specific error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (errors.profileImage) {
        setErrors({ ...errors, profileImage: '' });
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters long.';
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRe.test(formData.email)) {
      newErrors.email = 'A valid email address is required.';
    }

    const validRoles = ['developer', 'designer', 'manager'];
    if (!formData.role || !validRoles.includes(formData.role)) {
      newErrors.role = 'Please select a valid role.';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required.';
    } else {
      const dobDate = new Date(formData.dob);
      if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
        newErrors.dob = 'Date of birth must be in the past.';
      }
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters.';
    }

    if (!file) {
      newErrors.profileImage = 'Profile image is required.';
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        newErrors.profileImage = 'Only image files are allowed.';
      } else if (file.size > 5 * 1024 * 1024) {
        newErrors.profileImage = 'File too large. Max size is 5MB.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('role', formData.role);
    data.append('dob', formData.dob);
    data.append('bio', formData.bio);
    data.append('profileImage', file);

    try {
      const response = await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        showToast(result.message, 'success');
        // Reset form
        setFormData({ fullName: '', email: '', role: '', dob: '', bio: '' });
        setFile(null);
        setErrors({});
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        if (result.errors) {
          setErrors(result.errors);
          showToast('Please fix the errors in the form.', 'error');
        } else {
          showToast(result.message || 'Submission failed.', 'error');
        }
      }
    } catch (error) {
      showToast('Network error. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="premium-form" noValidate>
        <h2>Join Our Team</h2>
        
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={errors.fullName ? 'error-input' : ''}
            placeholder="John Doe"
          />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error-input' : ''}
            placeholder="john@example.com"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <div className="select-wrapper">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={errors.role ? 'error-input' : ''}
            >
              <option value="">Select a role...</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Project Manager</option>
            </select>
          </div>
          {errors.role && <span className="error-text">{errors.role}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className={errors.dob ? 'error-input' : ''}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dob && <span className="error-text">{errors.dob}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio (Optional)</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className={errors.bio ? 'error-input' : ''}
            placeholder="Tell us a little about yourself..."
            rows="3"
          />
          {errors.bio && <span className="error-text">{errors.bio}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="profileImage">Profile Image</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className={errors.profileImage ? 'error-input' : ''}
            />
          </div>
          {errors.profileImage && <span className="error-text">{errors.profileImage}</span>}
        </div>

        <button type="submit" disabled={isLoading} className={`submit-btn ${isLoading ? 'loading' : ''}`}>
          {isLoading ? <span className="spinner"></span> : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default Form;
