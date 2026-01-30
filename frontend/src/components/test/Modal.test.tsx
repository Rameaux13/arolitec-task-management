import React from 'react';
import { render, screen } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal Component', () => {
  test('affiche le modal quand isOpen est true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        message="Message de test"
        type="success"
      />
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Message de test')).toBeInTheDocument();
  });

  test('ne affiche pas le modal quand isOpen est false', () => {
    render(
      <Modal
        isOpen={false}
        onClose={() => {}}
        title="Test Modal"
        message="Message de test"
        type="success"
      />
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  test('affiche le titre correct', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Succès"
        message="Opération réussie"
        type="success"
      />
    );

    expect(screen.getByText('Succès')).toBeInTheDocument();
  });
});