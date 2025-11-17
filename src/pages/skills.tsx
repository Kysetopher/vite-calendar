import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/AppLayout";
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  Award, 
  TrendingUp, 
  BookOpen, 
  CheckCircle,
  PlayCircle,
  Users,
  Heart,
  MessageCircle,
  Brain,
  Zap
} from "lucide-react";
import type {
  CommunicationSkill,
  UserSkillProgress,
  UserStats,
  CommunicationChallenge,
  UserAchievement
} from "@/utils/schema/skills";
import { fetchWithAuthRefresh } from "@/lib/queryClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Skills() {
  const [selectedSkill, setSelectedSkill] = useState<CommunicationSkill | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<CommunicationChallenge | null>(null);
  const queryClient = useQueryClient();

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/skills/stats'],
  });

  // Fetch all skills
  const { data: skills = [] } = useQuery<CommunicationSkill[]>({
    queryKey: ['/api/skills'],
  });

  // Fetch user progress
  const { data: progress = [] } = useQuery<UserSkillProgress[]>({
    queryKey: ['/api/skills/progress'],
  });

  // Fetch user achievements
  const { data: achievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ['/api/achievements'],
  });

  // Fetch challenges for selected skill
  const { data: challenges = [] } = useQuery<CommunicationChallenge[]>({
    queryKey: ['/api/skills', selectedSkill?.id, 'challenges'],
    enabled: !!selectedSkill?.id,
  });

  const getSkillProgress = (skillId: number) => {
    return progress.find(p => p.skillId === skillId);
  };

  const getSkillIcon = (category: string) => {
    switch (category) {
      case 'conflict_resolution': return <Target className="h-5 w-5" />;
      case 'empathy': return <Heart className="h-5 w-5" />;
      case 'active_listening': return <Users className="h-5 w-5" />;
      case 'emotional_intelligence': return <Brain className="h-5 w-5" />;
      case 'assertive_communication': return <MessageCircle className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, CommunicationSkill[]>);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Communication Skills Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Develop better co-parenting communication through interactive challenges and personalized feedback
            </p>
          </div>

          {/* User Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userStats?.totalPoints || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      Level {userStats?.currentLevel || 1}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Current Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userStats?.challengesCompleted || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Challenges Done</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userStats?.currentStreak || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="skills">Skills & Challenges</TabsTrigger>
              <TabsTrigger value="progress">My Progress</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Skills & Challenges Tab */}
            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Skills Categories */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Communication Skills
                  </h2>
                  
                  {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                    <Card key={category} className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <div className="flex items-center">
                          {getSkillIcon(category)}
                          <CardTitle className="ml-2 capitalize">
                            {category.replace('_', ' ')}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {categorySkills.map((skill) => {
                          const skillProgress = getSkillProgress(skill.id);
                          const progressPercent = skillProgress 
                            ? (skillProgress.experience / skillProgress.experienceToNext) * 100 
                            : 0;

                          return (
                            <div
                              key={skill.id}
                              className={`p-4 rounded-lg border cursor-pointer transition-all transform hover:scale-[1.02] ${
                                selectedSkill?.id === skill.id
                                  ? 'border-[#275559] bg-[#275559]/10 shadow-lg ring-2 ring-[#275559]/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-[#275559]/50 hover:shadow-md'
                              }`}
                              onClick={() => {
                                console.log('Selecting skill:', skill.name);
                                setSelectedSkill(skill);
                              }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {skill.name}
                                </h3>
                                <Badge className={`${getDifficultyColor(skill.difficulty)} text-white`}>
                                  {skill.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {skill.description}
                              </p>
                              {skillProgress && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Level {skillProgress.level}</span>
                                    <span>{skillProgress.experience}/{skillProgress.experienceToNext} XP</span>
                                  </div>
                                  <Progress value={progressPercent} className="h-2" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Challenges for Selected Skill */}
                <div className="space-y-6">
                  {selectedSkill ? (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedSkill.name} Challenges
                      </h2>
                      
                      {challenges.length > 0 ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-500">Found {challenges.length} challenges</p>
                          {challenges.map((challenge) => (
                            <Card key={challenge.id} className="bg-white dark:bg-gray-800">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {challenge.title}
                                  </h3>
                                  <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                                    {challenge.difficulty}
                                  </Badge>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                  {challenge.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {challenge.timeEstimate} min
                                    </div>
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 mr-1" />
                                      {challenge.pointsReward} points
                                    </div>
                                  </div>
                                  
                                  <Button
                                    className="bg-[#275559] hover:bg-[#275559]/90 text-white"
                                    onClick={() => setActiveChallenge(challenge)}
                                  >
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Start Challenge
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="bg-white dark:bg-gray-800">
                          <CardContent className="p-8 text-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">
                              No challenges available for this skill yet. Check back soon!
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Card className="bg-white dark:bg-gray-800 border-dashed">
                      <CardContent className="p-8 text-center">
                        <Target className="h-16 w-16 text-[#275559]/60 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Select a Communication Skill
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Click on any skill card to view interactive challenges and start building better co-parenting communication
                        </p>
                        <div className="text-sm text-[#275559] font-medium">
                          👈 Try clicking "Active Listening" to get started
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {progress.map((prog) => {
                  const skill = skills.find(s => s.id === prog.skillId);
                  if (!skill) return null;
                  
                  const progressPercent = (prog.experience / prog.experienceToNext) * 100;
                  
                  return (
                    <Card key={prog.id} className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <div className="flex items-center">
                          {getSkillIcon(skill.category)}
                          <CardTitle className="ml-2">{skill.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Level {prog.level}</span>
                          <span>{prog.experience}/{prog.experienceToNext} XP</span>
                        </div>
                        <Progress value={progressPercent} className="h-3" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {prog.completedChallenges}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">Challenges</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {prog.streak}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">Day Streak</p>
                          </div>
                        </div>
                        
                        {prog.lastPracticed && (
                          <p className="text-xs text-gray-500">
                            Last practiced: {new Date(prog.lastPracticed).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {progress.length === 0 && (
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Start Your Journey
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Complete your first challenge to start tracking your progress!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                      <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Achievement Unlocked!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Unlocked on {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                      {achievement.isNew && (
                        <Badge className="bg-red-500 text-white mt-2">NEW!</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {achievements.length === 0 && (
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-8 text-center">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Achievements Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Complete challenges to unlock achievements and show your progress!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Challenge Modal would go here */}
      {activeChallenge && (
        <ChallengeModal 
          challenge={activeChallenge} 
          onClose={() => setActiveChallenge(null)}
          onComplete={() => {
            setActiveChallenge(null);
            queryClient.invalidateQueries({ queryKey: ['/api/skills/progress'] });
            queryClient.invalidateQueries({ queryKey: ['/api/skills/stats'] });
          }}
        />
      )}
    </Layout>
  );
}

// Challenge Modal Component
function ChallengeModal({ 
  challenge, 
  onClose, 
  onComplete 
}: { 
  challenge: CommunicationChallenge; 
  onClose: () => void;
  onComplete: () => void;
}) {
  const [response, setResponse] = useState("");
  const [startTime] = useState(Date.now());
  const queryClient = useQueryClient();

  const submitAttempt = useMutation({
    mutationFn: async (data: { response: string; timeSpent: number }) => {
      const res = await fetchWithAuthRefresh(
        `${API_BASE_URL}/api/challenges/${challenge.id}/attempt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error('Failed to submit attempt');
      return res.json();
    },
    onSuccess: () => {
      onComplete();
    },
  });

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    submitAttempt.mutate({ response, timeSpent });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{challenge.title}</CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Scenario:</h3>
            <p className="text-gray-700 dark:text-gray-300">{challenge.scenario}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Response:</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg resize-none"
              placeholder="How would you handle this situation? Write your response here..."
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Estimated time: {challenge.timeEstimate} minutes
            </div>
            <div className="space-x-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                className="bg-[#275559] hover:bg-[#275559]/90 text-white"
                onClick={handleSubmit}
                disabled={!response.trim() || submitAttempt.isPending}
              >
                {submitAttempt.isPending ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}