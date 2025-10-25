import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';
import { useNotifications } from '@/contexts/notification-context';

export const NotificationTest: React.FC = () => {
  const [ title, setTitle ] = useState('');
  const [ message, setMessage ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const { refreshNotifications } = useNotifications();

  const handleCreateNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please fill in both title and message');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/notifications', {
        title: title.trim(),
        message: message.trim(),
      });

      if (response.data.success) {
        alert('Notification created successfully!');
        setTitle('');
        setMessage('');
        await refreshNotifications();
      } else {
        alert('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Error creating notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Notification System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
          />
        </div>
        <Button
          onClick={handleCreateNotification}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Test Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};
