import { useState, useEffect } from 'react';
import { Student, Observation } from '../lib/types';
import { getObservationsByStudent, deleteObservation } from '../lib/storage';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, Trash2, FileText, Mic, Image as ImageIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { formatStudentName } from '../lib/utils';

interface StudentDetailProps {
  student: Student;
  onBack: () => void;
  onAddObservation: () => void;
  onGenerateEvaluation: () => void;
}

export function StudentDetail({
  student,
  onBack,
  onAddObservation,
  onGenerateEvaluation,
}: StudentDetailProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const loadObservations = () => {
    const obs = getObservationsByStudent(student.id);
    setObservations(obs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  useEffect(() => {
    loadObservations();
  }, [student.id]);

  useEffect(() => {
    const interval = setInterval(loadObservations, 1000);
    return () => clearInterval(interval);
  }, [student.id]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this observation?')) {
      deleteObservation(id);
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

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button  onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl mb-1 text-gray-900">{formatStudentName(student.name)}</h1>
          <p className="text-gray-600">Grade {student.grade}</p>
        </div>
        <Button onClick={onAddObservation} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Observation
        </Button>
        <Button
          onClick={onGenerateEvaluation}
          
          className="gap-2"
          disabled={observations.length === 0}
        >
          <Sparkles className="w-4 h-4" />
          Generate Evaluation
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({observations.length})
        </Button>
        <Button
          
          size="sm"
          onClick={() => setFilter('text')}
        >
          Text ({observations.filter(o => o.type === 'text').length})
        </Button>
        <Button
          
          size="sm"
          onClick={() => setFilter('audio')}
        >
          Audio ({observations.filter(o => o.type === 'audio').length})
        </Button>
        <Button
          
          size="sm"
          onClick={() => setFilter('image')}
        >
          Image ({observations.filter(o => o.type === 'image').length})
        </Button>
      </div>

      <div className="space-y-4">
        {filteredObservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">
                {filter === 'all'
                  ? 'No observations yet. Add your first observation to get started.'
                  : `No ${filter} observations found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredObservations.map(obs => (
            <Card key={obs.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getIcon(obs.type)}
                      <Badge  className="capitalize">
                        {obs.type}
                      </Badge>
                      {obs.subject && <Badge >{obs.subject}</Badge>}
                      {obs.tags.map(tag => (
                        <Badge key={tag} >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardDescription>
                      {format(new Date(obs.timestamp), 'PPP p')}
                    </CardDescription>
                  </div>
                  <Button
                    
                    size="sm"
                    onClick={() => handleDelete(obs.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{obs.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
