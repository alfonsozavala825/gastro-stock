// Mock localStorage globally for this test file
const localStorageMock = (function () {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'localStorage', { value: localStorageMock });


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import useAuthHook from '../../hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAuthHook
jest.mock('../../hooks/useAuth');

// Mock API_URL from config.js
jest.mock('../../config', () => 'http://localhost:5000/api');

// Mock AuthContext
const mockLogin = jest.fn();
const mockLogout = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    token: null,
    user: null,
    login: mockLogin,
    logout: mockLogout,
    setToken: jest.fn(),
    setUser: jest.fn(),
  }),
}));

describe('Login', () => {
  beforeEach(() => {
    localStorageMock.clear(); // Clear localStorage before each test
    // Reset mocks before each test
    useAuthHook.mockReturnValue({
      login: jest.fn(() => Promise.resolve({ success: true })),
      isLoading: false,
      error: null,
    });
    mockLogin.mockClear();
    mockLogout.mockClear();
  });

  it('renders the login form', () => {
    render(<Login />);
    expect(screen.getByText('Gastro-Stock 🍽️')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/correo/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login on form submission and updates context on success', async () => {
    const mockPerformLogin = jest.fn(() => Promise.resolve({ success: true }));
    useAuthHook.mockReturnValue({
      login: mockPerformLogin,
      isLoading: false,
      error: null,
    });
    
    // Set localStorage items that AuthContext would expect to find
    localStorageMock.setItem('token', 'mock-token');
    localStorageMock.setItem('usuario', JSON.stringify({ nombre: 'Test User' }));


    render(<Login />);
    const emailInput = screen.getByLabelText(/correo/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPerformLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      // Verify that the context login was called with the values that useAuthHook would have stored
      expect(mockLogin).toHaveBeenCalledWith('mock-token', { nombre: 'Test User' });
    });
  });

  it('displays error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    useAuthHook.mockReturnValue({
      login: jest.fn(() => Promise.resolve({ success: false, message: errorMessage })),
      isLoading: false,
      error: errorMessage,
    });

    render(<Login />);
    const emailInput = screen.getByLabelText(/correo/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables button while loading', () => {
    useAuthHook.mockReturnValue({
      login: jest.fn(() => new Promise(() => {})), // Never resolves, keeps isLoading true
      isLoading: true,
      error: null,
    });

    render(<Login />);
    const submitButton = screen.getByRole('button', { name: /iniciando.../i });
    expect(submitButton).toBeDisabled();
  });
});
