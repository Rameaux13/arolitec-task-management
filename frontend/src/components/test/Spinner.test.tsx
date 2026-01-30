import React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from '../Spinner';

describe('Spinner Component', () => {
  test('affiche le spinner', () => {
    const { container } = render(<Spinner />);
    
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  test('affiche le message par défaut', () => {
    render(<Spinner />);
    
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  test('affiche un message personnalisé', () => {
    render(<Spinner message="Veuillez patienter..." />);
    
    expect(screen.getByText(/veuillez patienter/i)).toBeInTheDocument();
  });

  test('affiche l\'overlay', () => {
    const { container } = render(<Spinner />);
    
    const overlay = container.querySelector('.spinnerOverlay');
    expect(overlay).toBeInTheDocument();
  });
});