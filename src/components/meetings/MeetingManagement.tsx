import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  agenda: any[];
  attendees: any[];
  minutes: any;
  created_by: string;
  reminder_sent: boolean;
  group: {
    name: string;
  };
}

interface MeetingForm {
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  agenda: string;
}

interface MeetingManagementProps {
  groupId?: string;
}

const MeetingManagement = ({ groupId }: MeetingManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [form, setForm] = useState<MeetingForm>({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    location: '',
    agenda: ''
  });

  useEffect(() => {
    loadMeetings();
  }, [groupId]);

  const loadMeetings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (groupId) {
        const data = await apiClient.get(`/api/groups/${groupId}/meetings`);
        setMeetings(data || []);
      } else {
        // TODO: Implement endpoint for user meetings across all groups
        // For now, return empty array
        setMeetings([]);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      meeting_date: '',
      meeting_time: '',
      location: '',
      agenda: ''
    });
    setEditingMeeting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupId) return;

    if (!form.title || !form.meeting_date || !form.meeting_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const agendaItems = form.agenda
        .split('\n')
        .filter(item => item.trim())
        .map(item => ({ item: item.trim(), completed: false }));

      const meetingData = {
        title: form.title,
        description: form.description,
        meeting_date: form.meeting_date,
        meeting_time: form.meeting_time,
        location: form.location,
        agenda: agendaItems,
        group_id: groupId,
        created_by: user.id
      };

      if (editingMeeting) {
        // TODO: Implement meeting update endpoint
        toast({
          title: "Info",
          description: "Meeting update functionality coming soon",
        });
      } else {
        await apiClient.post(`/api/groups/${groupId}/meetings`, meetingData);
        toast({
          title: "Success",
          description: "Meeting scheduled successfully",
        });
      }

      resetForm();
      setOpen(false);
      loadMeetings();
    } catch (error: any) {
      console.error('Error saving meeting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save meeting",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setForm({
      title: meeting.title,
      description: meeting.description,
      meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time,
      location: meeting.location,
      agenda: meeting.agenda.map((item: any) => item.item).join('\n')
    });
    setOpen(true);
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      await apiClient.delete(`/api/meetings/${meetingId}`);
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
      loadMeetings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meeting",
        variant: "destructive",
      });
    }
  };

  const updateMeetingStatus = async (meetingId: string, status: string) => {
    try {
      // TODO: Implement meeting status update endpoint
      toast({
        title: "Info",
        description: `Meeting status update to ${status} coming soon`,
      });
      loadMeetings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update meeting status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meeting Management</h2>
        {groupId && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Monthly Group Meeting"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Meeting description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meeting_date">Date *</Label>
                    <Input
                      id="meeting_date"
                      type="date"
                      value={form.meeting_date}
                      onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting_time">Time *</Label>
                    <Input
                      id="meeting_time"
                      type="time"
                      value={form.meeting_time}
                      onChange={(e) => setForm({ ...form, meeting_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Community Center, Online, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="agenda">Agenda (one item per line)</Label>
                  <Textarea
                    id="agenda"
                    value={form.agenda}
                    onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                    placeholder="Opening remarks&#10;Treasurer's report&#10;New business&#10;Next meeting date"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Saving..." : editingMeeting ? "Update Meeting" : "Schedule Meeting"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No meetings scheduled</h3>
            <p className="text-gray-600">
              {groupId ? "Schedule your first group meeting" : "No meetings found for your groups"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {meeting.title}
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    {!groupId && (
                      <p className="text-sm text-gray-600 mt-1">
                        Group: {meeting.group.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {meeting.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMeetingStatus(meeting.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(meeting)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(meeting.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(meeting.meeting_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(meeting.meeting_time)}
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {meeting.location}
                      </div>
                    )}
                  </div>

                  {meeting.description && (
                    <p className="text-gray-700">{meeting.description}</p>
                  )}

                  {meeting.agenda && meeting.agenda.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Agenda:</h4>
                      <ul className="space-y-1">
                        {meeting.agenda.map((item: any, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {item.item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingManagement;
