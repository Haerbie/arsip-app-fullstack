"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <ShieldX className="h-16 w-16 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Akses Ditolak</CardTitle>
                    <CardDescription className="text-base">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            <strong>Informasi:</strong> Halaman ini memerlukan izin khusus yang tidak dimiliki oleh akun Anda.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Jika Anda believe ini adalah kesalahan, silakan hubungi administrator sistem.
                        </p>
                    </div>

                    <div className="pt-4 space-y-2">
                        <Link href="/dashboard">
                            <Button className="w-full">
                                <Home className="mr-2 h-4 w-4" />
                                Kembali ke Dashboard
                            </Button>
                        </Link>
                        <Link href="/sign-in">
                            <Button className="w-full" variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Halaman Masuk
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}