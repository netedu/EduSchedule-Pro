import { BookOpenCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { MasterDataView } from "@/components/master-data/master-data-view";
import { FirebaseStatusIndicator } from "@/components/common/firebase-status-indicator";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6 no-print">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold font-headline text-foreground">
            EduSchedule Pro
          </h1>
        </div>
        <div>
          <FirebaseStatusIndicator />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <Tabs defaultValue="schedule" className="no-print">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="schedule">Jadwal</TabsTrigger>
            <TabsTrigger value="master-data">Data Master</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Tampilan Jadwal</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleView />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="master-data">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Manajemen Data Master</CardTitle>
              </CardHeader>
              <CardContent>
                <MasterDataView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    