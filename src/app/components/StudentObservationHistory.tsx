import { useState, useEffect } from 'react';
import { Student, Observation } from '../lib/types';
import { getObservationsByStudent, deleteObservation } from '../lib/storage';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, FileText, Mic, Image as ImageIcon, Trash2, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { LaurelLogo } from './LaurelLogo';
import { formatStudentName } from '../lib/utils';
import { performanceLevelLabel, performanceLevelColor } from '../lib/performanceLevel';
import { useSchoolName } from '../lib/useSchoolName';

interface StudentObservationHistoryProps {
  student: Student;
  onBack: () => void;
}

export function StudentObservationHistory({ student, onBack }: StudentObservationHistoryProps) {
  const { schoolName, badgeLetter } = useSchoolName();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const loadObservations = () => {
    getObservationsByStudent(student.id).then(obs => {
      setObservations(obs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });
  };

  useEffect(() => {
    loadObservations();
  }, [student.id]);

  const handleDelete = async (observation: Observation) => {
    if (confirm('Are you sure you want to delete this observation?')) {
      await deleteObservation(observation);
      loadObservations();
    }
  };

  const filteredObservations = filter === 'all'
    ? observations
    : observations.filter(o => o.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return '#7D9D77';
      case 'audio': return '#6B5FE4';
      case 'image': return '#767F93';
      default: return '#767F93';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FC] to-[#EBE8F5] flex flex-col">
      <div className="bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4] text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button  size="sm" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LaurelLogo height="sm" inverted={true} showProductName />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {badgeLetter}
            </div>
            <div className="text-xs text-white/80">{schoolName}</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-1">Observation History</h1>
        <p className="text-white/90">{formatStudentName(student.name)} - Grade {student.grade}</p>
        <div className="mt-3 bg-white/20 rounded-lg p-2 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl font-bold">{observations.length}</div>
            <div className="text-xs">Total Observations</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gradient-to-r from-[#1A1A40] to-[#6B5FE4]' : ''}
          >
            All ({observations.length})
          </Button>
          <Button
            
            size="sm"
            onClick={() => setFilter('text')}
            style={filter === 'text' ? { backgroundColor: '#7D9D77' } : {}}
          >
            Text ({observations.filter(o => o.type === 'text').length})
          </Button>
          <Button
            
            size="sm"
            onClick={() => setFilter('audio')}
            style={filter === 'audio' ? { backgroundColor: '#6B5FE4' } : {}}
          >
            Audio ({observations.filter(o => o.type === 'audio').length})
          </Button>
          <Button
            
            size="sm"
            onClick={() => setFilter('image')}
            style={filter === 'image' ? { backgroundColor: '#767F93' } : {}}
          >
            Image ({observations.filter(o => o.type === 'image').length})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filteredObservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">
                {filter === 'all'
                  ? 'No observations yet'
                  : `No ${filter} observations found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredObservations.map(obs => (
            <Card key={obs.id} className="border-l-4" style={{ borderLeftColor: getTypeColor(obs.type) }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${getTypeColor(obs.type)}20` }}
                      >
                        {getIcon(obs.type)}
                      </div>
                      <Badge  className="capitalize">
                        {obs.type}
                      </Badge>
                      {obs.subject && (
                        <Badge  className="text-xs">
                          {obs.subject}
                        </Badge>
                      )}
                      {obs.performanceLevel && (
                        <Badge
                          className="text-xs text-white"
                          style={{ backgroundColor: performanceLevelColor(obs.performanceLevel) }}
                        >
                          {performanceLevelLabel(obs.performanceLevel)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(obs.timestamp), 'MMM d, yyyy - h:mm a')}
                    </div>
                  </div>
                  <Button

                    size="sm"
                    onClick={() => handleDelete(obs)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    aria-label={`Delete observation from ${format(new Date(obs.timestamp), 'MMM d, yyyy')}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {obs.type === 'audio' && obs.mediaUrl && (
                  <audio controls src={obs.mediaUrl} className="w-full mb-3" />
                )}
                {obs.type === 'image' && obs.mediaUrl && (
                  <img src={obs.mediaUrl} alt="Observation attachment" className="w-full rounded-lg mb-3 max-h-64 object-cover" />
                )}
                <p className="text-sm whitespace-pre-wrap mb-3">{obs.content}</p>
                {obs.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <Tag className="w-3 h-3 text-gray-400" />
                    {obs.tags.map(tag => (
                      <Badge key={tag}  className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
