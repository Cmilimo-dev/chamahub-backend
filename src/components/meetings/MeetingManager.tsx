import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Users, Bell } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Meeting {
  id: string;
  group_id: string;
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  agenda: string[];
  created_by: string;
  attendees: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  reminder_sent: boolean;
}

interface MeetingManagerProps {
  groupId: string;
  groupName: string;
}

export const MeetingManager: React.FC<MeetingManagerProps> = ({ groupId, groupName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    location: '',
    agenda: ['']
  });

  useEffect(() => {
    fetchMeetings();
  }, [groupId]);

  const fetchMeetings = async () => {
    try {
      const data = await apiClient.get(`/groups/${groupId}/meetings`);
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive"
      });
    }
  };

  const createMeeting = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await apiClient.post(`/groups/${groupId}/meetings`, {
        title: newMeeting.title,
        description: newMeeting.description,
        meeting_date: newMeeting.meeting_date,
        meeting_time: newMeeting.meeting_time,
        location: newMeeting.location,
        agenda: newMeeting.agenda.filter(item => item.trim() !== ''),
        created_by: user.id,
        status: 'scheduled'
      });

      toast({
        title: "Success",
        description: "Meeting scheduled successfully"
      });

      setNewMeeting({
        title: '',
        description: '',
        meeting_date: '',
        meeting_time: '',
        location: '',
        agenda: ['']
      });
      
      setShowCreateForm(false);
      fetchMeetings();
      
      // Send notifications to group members
      await scheduleReminders(groupId, newMeeting.title, newMeeting.meeting_date, newMeeting.meeting_time);
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleReminders = async (groupId: string, title: string, date: string, time: string) => {
    try {
      // Send immediate notification
      await apiClient.post('/notifications/send-group-notification', {
        groupId,
        title: 'New Meeting Scheduled',
        body: `${title} on ${date} at ${time}`,
        data: { type: 'meeting_scheduled' }
      });

      // Schedule reminder 24 hours before
      const meetingDateTime = new Date(`${date}T${time}`);
      const reminderTime = new Date(meetingDateTime.getTime() - 24 * 60 * 60 * 1000);
      
      await apiClient.post('/notifications/schedule', {
        group_id: groupId,
        notification_type: 'meeting_reminder',
        title: 'Meeting Reminder',
        body: `${title} is tomorrow at ${time}`,
        scheduled_for: reminderTime.toISOString(),
        data: { type: 'meeting_reminder', meeting_date: date, meeting_time: time }
      });

    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  };

  const addAgendaItem = () => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: [...prev.agenda, '']
    }));
  };

  const updateAgendaItem = (index: number, value: string) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => i === index ? value : item)
    }));
  };

  const removeAgendaItem = (index: number) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Group Meetings</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Schedule Meeting
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Meeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Monthly Chama Meeting"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Meeting description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMeeting.meeting_date}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMeeting.meeting_time}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Community Center"
              />
            </div>

            <div>
              <Label>Agenda Items</Label>
              {newMeeting.agenda.map((item, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={item}
                    onChange={(e) => updateAgendaItem(index, e.target.value)}
                    placeholder="Agenda item..."
                  />
                  {newMeeting.agenda.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAgendaItem(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgendaItem}
                className="mt-2"
              >
                Add Agenda Item
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={createMeeting} disabled={loading}>
                {loading ? 'Creating...' : 'Schedule Meeting'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {meeting.title}
                <span className={`px-2 py-1 rounded text-xs ${
                  meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                  meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {meeting.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-600">{meeting.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(meeting.meeting_date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(meeting.meeting_time)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {meeting.location}
                  </div>
                </div>

                {meeting.agenda && meeting.agenda.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Agenda:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {meeting.agenda.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
