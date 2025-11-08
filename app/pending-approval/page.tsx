"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <Clock className="h-16 w-16 text-orange-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Pendaftaran Berhasil!</CardTitle>
                    <CardDescription className="text-base">
                        Akun Anda telah berhasil dibuat dan menunggu persetujuan dari Super Admin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-800">
                            <strong>Informasi:</strong> Anda akan dapat masuk setelah akun Anda disetujui oleh administrator.
                            Proses ini biasanya memakan waktu 1x24 jam.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                            <p>Silakan hubungi administrator jika:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Lebih dari 24 jam berlalu</li>
                                <li>Anda memiliki pertanyaan lain</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Link href="/sign-in">
                            <Button className="w-full" variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Halaman Masuk
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}