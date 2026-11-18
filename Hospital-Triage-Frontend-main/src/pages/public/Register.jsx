import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { validatePhone } from '../../utils/validators';
import { UserPlus } from 'lucide-react';

export function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register({
        name,
        phone,
        email,
        password,
        age,
        gender,
        bloodGroup,
        allergies,
      });
      navigate('/login', {
        replace: true,
        state: {
          registrationComplete: true,
          registeredEmail: email,
          from: location.state?.from,
        },
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="double-bezel-outer">
        <div className="double-bezel-inner bg-surface space-y-6">
          <div className="text-center pb-4 border-b border-border/70">
            <span className="eyebrow-tag mb-2">New Patient Portal</span>
            <h1 className="text-2xl font-display font-bold text-ink">Patient Registration</h1>
            <p className="text-xs text-ink-muted mt-1">
              Create your medical profile, then sign in to book appointments and track your queue.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-alert-light border border-alert-border text-xs text-alert font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="E.g. Deepa Sundaram"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="deepa@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              helperText="Use at least 12 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={12}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={12}
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Age"
                type="number"
                placeholder="29"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-canvas-pure border border-border rounded-xl py-2.5 px-3 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-canvas-pure border border-border rounded-xl py-2.5 px-3 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <Input
              label="Known Allergies (Optional)"
              placeholder="E.g. Penicillin, Peanuts, None known"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              icon={UserPlus}
              trailingIcon
            >
              Create Account
            </Button>
          </form>

          <div className="pt-3 border-t border-border/60 text-center text-xs text-ink-muted">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in to portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
