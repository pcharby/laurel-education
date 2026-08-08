import { useState } from 'react';
import { Observation } from '../lib/types';
import { saveObservation } from '../lib/storage';
import { CadentLogo } from './CadentLogo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { FileText, Mic, Image as ImageIcon, X } from 'lucide-react';

interface AddObservationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId: string;
  initialType?: 'text' | 'audio' | 'image';
  subject?: string;
}

type PerformanceLevel = 'needs-support' | 'still-learning' | 'meets-expectations' | 'exceeds-expectations';

const getRubricsForSubject = (subject: string) => {
  switch (subject) {
    case 'Mathematics':
      return [
        'Problem Solving',
        'Number Sense',
        'Algebraic Thinking',
        'Data Management',
        'Spatial Reasoning',
        'Mathematical Communication',
      ];
    case 'Science':
      return [
        'Scientific Inquiry',
        'Critical Thinking',
        'Observation Skills',
        'Hypothesis Formation',
        'Data Collection',
        'Scientific Communication',
      ];
    case 'Language Arts':
      return [
        'Reading Comprehension',
        'Written Expression',
        'Oral Communication',
        'Critical Analysis',
        'Creative Writing',
        'Grammar & Mechanics',
      ];
    default:
      return ['General Performance', 'Participation', 'Collaboration'];
  }
};

export function AddObservationDialog({
  open,
  onClose,
  onSuccess,
  studentId,
  initialType = 'text',
  subject = '',
}: AddObservationDialogProps) {
  const [type, setType] = useState<'text' | 'audio' | 'image'>(initialType);
  const [content, setContent] = useState('');
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel | ''>('');
  const [selectedStrand, setSelectedStrand] = useState<string>('');
  const [selectedObjective, setSelectedObjective] = useState<string>('');

  const rubrics = getRubricsForSubject(subject);

  // Grade 5 Curriculum Strands
  const strands = {
    'Mathematics': [
      { name: 'Number', objectives: ['Place Value', 'Operations', 'Fractions', 'Decimals'] },
      { name: 'Algebra', objectives: ['Patterns & Relationships', 'Equations & Inequalities', 'Coding'] },
      { name: 'Data', objectives: ['Data Collection', 'Data Visualization', 'Data Analysis'] },
      { name: 'Spatial Sense', objectives: ['Geometric Properties', 'Location & Movement', 'Measurement'] },
      { name: 'Financial Literacy', objectives: ['Money Concepts', 'Consumer Awareness', 'Financial Planning'] },
    ],
    'Science': [
      { name: 'Life Systems', objectives: ['Human Organ Systems', 'Body Functions', 'Health & Well-being'] },
      { name: 'Structures and Mechanisms', objectives: ['Forces Acting on Structures', 'Structural Design', 'Engineering'] },
      { name: 'Matter and Energy', objectives: ['Properties of Matter', 'Changes in Matter', 'Energy Conservation'] },
      { name: 'Earth and Space Systems', objectives: ['Conservation of Energy', 'Renewable Resources', 'Environmental Impact'] },
    ],
    'Language Arts': [
      { name: 'Reading', objectives: ['Comprehension Strategies', 'Literary Elements', 'Critical Analysis'] },
      { name: 'Writing', objectives: ['Text Forms', 'Writing Process', 'Grammar & Mechanics'] },
      { name: 'Oral Communication', objectives: ['Active Listening', 'Speaking Skills', 'Presentation'] },
      { name: 'Media Literacy', objectives: ['Media Forms', 'Digital Citizenship', 'Critical Media Analysis'] },
    ],
  };

  const currentStrands = strands[subject as keyof typeof strands] || [];
  const currentObjectives = selectedStrand
    ? currentStrands.find(s => s.name === selectedStrand)?.objectives || []
    : [];
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioChunks(chunks);

        // Mock transcription
        setIsTranscribing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const duration = Math.floor(recordingDuration);
        setContent(`[Transcribed audio - ${duration}s recording]\n\nStudent demonstrated strong problem-solving skills during the mathematics activity. Showed excellent collaboration with peers and asked thoughtful questions about the concept being taught. Maintained focus throughout the lesson and actively participated in class discussion.`);
        setIsTranscribing(false);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (recorder.state === 'recording') {
          setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
        } else {
          clearInterval(interval);
        }
      }, 100);
    } catch (err) {
      setError('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);
    setAudioChunks([]);
    setRecordingDuration(0);
    setContent('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setContent(`Image uploaded: ${file.name}\n\nAdd your observations and context about this image here.`);
    }
  };

  const toggleRubric = (rubric: string) => {
    setSelectedRubrics(prev =>
      prev.includes(rubric)
        ? prev.filter(r => r !== rubric)
        : [...prev, rubric]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter observation content');
      return;
    }

    const newObservation: Observation = {
      id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      type,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      tags: [...selectedRubrics, ...tags],
      subject: subject || undefined,
    };

    await saveObservation(newObservation);

    // Reset form
    setContent('');
    setSelectedRubrics([]);
    setTags([]);
    setTagInput('');
    setAudioFile(null);
    setImageFile(null);
    setAudioUrl(null);
    setAudioChunks([]);
    setRecordingDuration(0);
    setIsRecording(false);
    setError('');
    setType('text');

    onSuccess();
    onClose();
  };

  const getTypeColor = () => {
    switch (type) {
      case 'text': return '#7D9D77';
      case 'audio': return '#6B5FE4';
      case 'image': return '#767F93';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[95vh] overflow-y-auto sm:max-h-screen">
        <DialogHeader style={{ backgroundColor: `${getTypeColor()}10` }} className="p-4 -m-6 mb-4 rounded-t-lg">
          <div className="flex items-center justify-between mb-2">
            <CadentLogo height="sm" showProductName />
            <div className="text-right text-xs text-gray-600">
              <div>Riverside Elementary</div>
            </div>
          </div>
          <DialogTitle className="text-lg">Record Observation</DialogTitle>
          <DialogDescription className="text-sm">
            Capture what you observed about this student's learning, participation, or achievement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="text-content" className="text-base font-semibold">Your Observation</Label>
              <Textarea
                id="text-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe what you observed about the student's learning, participation, or achievement..."
                rows={8}
                className="text-base"
             />
            </div>
          )}

          {type === 'audio' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Voice Recording</Label>
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                {!isRecording && !audioUrl ? (
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-[#6B5FE4]/20 rounded-full flex items-center justify-center mb-4">
                      <Mic className="w-10 h-10 text-[#6B5FE4]" />
                    </div>
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="gap-2 h-12 px-6"
                      style={{ backgroundColor: '#6B5FE4' }}
                    >
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </Button>
                    <p className="text-sm text-gray-600 mt-3">Tap to begin voice recording</p>
                  </div>
                ) : isRecording ? (
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Mic className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-mono mb-4 font-bold">
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </div>
                    <Button onClick={stopRecording} size="lg"  className="h-12 px-6">
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Mic className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="mb-4 font-semibold">Recording complete ({recordingDuration}s)</p>
                    {audioUrl && (
                      <audio controls src={audioUrl} className="w-full mb-4" />
                    )}
                    <Button onClick={clearRecording}  size="sm">
                      Record Again
                    </Button>
                  </div>
                )}
              </div>

              {isTranscribing && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription>Transcribing audio...</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="audio-content" className="text-base font-semibold">Transcription / Notes</Label>
                <Textarea
                  id="audio-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Audio transcription will appear here. You can edit or add additional notes..."
                  rows={6}
                  className="text-base"
               />
              </div>
            </div>
          )}

          {type === 'image' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Photo Capture</Label>
              <div className="space-y-3">
                <Button
                  onClick={() => document.getElementById('image-camera')?.click()}
                  className="w-full h-16 text-base font-semibold gap-3"
                  style={{ backgroundColor: '#767F93' }}
                >
                  <ImageIcon className="w-6 h-6" />
                  Take Photo with Camera
                </Button>
                <input
                  id="image-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
               />

                <Button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  
                  className="w-full h-16 text-base font-semibold gap-3 border-2"
                >
                  <ImageIcon className="w-6 h-6" />
                  Upload Existing Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
               />
              </div>

              {imageFile && (
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-sm text-green-700 font-semibold mb-1">Image Selected:</p>
                  <p className="text-sm font-medium">{imageFile.name}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="image-content" className="text-base font-semibold">Observation Notes</Label>
                <Textarea
                  id="image-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe what this image shows about the student's work, understanding, or achievement..."
                  rows={6}
                  className="text-base"
               />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Curriculum Strand</Label>
            <select
              value={selectedStrand}
              onChange={(e) => {
                setSelectedStrand(e.target.value);
                setSelectedObjective('');
              }}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
            >
              <option value="">Select Strand...</option>
              {currentStrands.map((strand) => (
                <option key={strand.name} value={strand.name}>
                  {strand.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStrand && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Learning Objective</Label>
              <select
                value={selectedObjective}
                onChange={(e) => setSelectedObjective(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
              >
                <option value="">Select Learning Objective...</option>
                {currentObjectives.map((objective) => (
                  <option key={objective} value={objective}>
                    {objective}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-base font-semibold">Performance Level</Label>
            <RadioGroup value={performanceLevel} onValueChange={(v) => setPerformanceLevel(v as PerformanceLevel)}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:border-red-300 has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                  <RadioGroupItem value="needs-support" id="needs-support" />
                  <Label htmlFor="needs-support" className="cursor-pointer flex-1">
                    Needs Support
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:border-yellow-300 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50">
                  <RadioGroupItem value="still-learning" id="still-learning" />
                  <Label htmlFor="still-learning" className="cursor-pointer flex-1">
                    Still Learning
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:border-green-300 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                  <RadioGroupItem value="meets-expectations" id="meets-expectations" />
                  <Label htmlFor="meets-expectations" className="cursor-pointer flex-1">
                    Meets Expectations
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:border-blue-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <RadioGroupItem value="exceeds-expectations" id="exceeds-expectations" />
                  <Label htmlFor="exceeds-expectations" className="cursor-pointer flex-1">
                    Exceeds Expectations
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Curriculum Rubrics</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border-2 rounded-lg p-3 bg-gray-50">
              {rubrics.map((rubric) => (
                <div key={rubric} className="flex items-center gap-3 py-1">
                  <Checkbox
                    id={rubric}
                    checked={selectedRubrics.includes(rubric)}
                    onCheckedChange={() => toggleRubric(rubric)}
                    className="h-5 w-5"
                 />
                  <label
                    htmlFor={rubric}
                    className="text-sm cursor-pointer select-none flex-1"
                  >
                    {rubric}
                  </label>
                </div>
              ))}
            </div>
            {selectedRubrics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedRubrics.map(rubric => (
                  <Badge key={rubric} style={{ backgroundColor: getTypeColor() }} className="text-white">
                    {rubric}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Additional Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="e.g., group work, homework"
             />
              <Button type="button" onClick={handleAddTag} >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag}  className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {error && (
            <Alert >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button  onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 sm:flex-none"
            style={{ backgroundColor: getTypeColor() }}
          >
            Save Observation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
