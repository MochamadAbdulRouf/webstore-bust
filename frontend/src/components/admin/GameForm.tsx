'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { Game } from '@/types';
import { getErrorMessage } from '@/lib/utils';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface GameFormProps {
  game?: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const GameForm: React.FC<GameFormProps> = ({
  game = null,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({
    title: game?.title || '',
    description: game?.description || '',
    longDesc: game?.longDesc || '',
    price: game?.price?.toString() || '',
    category: game?.category || 'Action',
    publisher: game?.publisher || '',
    developer: game?.developer || '',
    tags: game?.tags?.join(', ') || '',
    featured: game?.featured || false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') {
          formData.append(k, (v as string).split(',').map((t: string) => t.trim()).join(','));
        } else {
          formData.append(k, String(v));
        }
      });
      if (imageFile) formData.append('image', imageFile);

      if (game) {
        await api.put(`/admin/games/${game.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Game updated!');
      } else {
        await api.post('/admin/games', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Game created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { value: 'Action', label: 'Action' },
    { value: 'RPG', label: 'RPG' },
    { value: 'Strategy', label: 'Strategy' },
    { value: 'Puzzle', label: 'Puzzle' },
    { value: 'Racing', label: 'Racing' },
    { value: 'Horror', label: 'Horror' },
    { value: 'Simulation', label: 'Simulation' },
    { value: 'Adventure', label: 'Adventure' },
    { value: 'Shooter', label: 'Shooter' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={game ? 'Edit Game' : 'Add New Game'}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            as="input"
            label="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            containerStyle={{ gridColumn: '1 / -1', marginBottom: '0.75rem' }}
          />

          <Input
            as="input"
            type="number"
            label="Price ($) *"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            containerStyle={{ marginBottom: '0.75rem' }}
          />

          <Input
            as="select"
            label="Category *"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={categories}
            containerStyle={{ marginBottom: '0.75rem' }}
          />

          <Input
            as="input"
            label="Publisher *"
            value={form.publisher}
            onChange={(e) => setForm({ ...form, publisher: e.target.value })}
            required
            containerStyle={{ marginBottom: '0.75rem' }}
          />

          <Input
            as="input"
            label="Developer"
            value={form.developer}
            onChange={(e) => setForm({ ...form, developer: e.target.value })}
            containerStyle={{ marginBottom: '0.75rem' }}
          />

          <Input
            as="input"
            label="Tags (comma-separated)"
            placeholder="rpg, action, open-world"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            containerStyle={{ gridColumn: '1 / -1', marginBottom: '0.75rem' }}
          />

          <Input
            as="textarea"
            label="Short Description *"
            style={{ minHeight: 80 }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            containerStyle={{ gridColumn: '1 / -1', marginBottom: '0.75rem' }}
          />

          <Input
            as="textarea"
            label="Full Description"
            style={{ minHeight: 120 }}
            value={form.longDesc}
            onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
            containerStyle={{ gridColumn: '1 / -1', marginBottom: '0.75rem' }}
          />

          <Input
            as="input"
            type="file"
            label="Cover Image"
            accept="image/*"
            style={{ padding: '0.5rem' }}
            onChange={(e) => setImageFile((e.target as HTMLInputElement).files?.[0] || null)}
            containerStyle={{ gridColumn: '1 / -1', marginBottom: '1.25rem' }}
          />

          <div
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <label htmlFor="featured" style={{ fontWeight: 500, cursor: 'pointer' }}>
              Feature this game on homepage
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="submit" loading={saving} disabled={saving}>
            {game ? 'Save Changes' : 'Create Game'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GameForm;
