
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase/provider";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export default function SignUpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // 2. Create user profile in Firestore
            const userRef = doc(firestore, "users", user.uid);
            await setDoc(userRef, {
                id: user.uid,
                email: values.email,
                firstName: values.name.split(' ')[0] || '',
                lastName: values.name.split(' ').slice(1).join(' ') || '',
                createdAt: serverTimestamp()
            });

            toast({
                title: "Account Created",
                description: "You have successfully signed up.",
            });
            router.push("/");
        } catch (error) {
            console.error("Signup Error: ", error);
            let description = "An unexpected error occurred. Please try again.";
            if (error instanceof FirebaseError) {
                switch(error.code) {
                    case 'auth/email-already-in-use':
                        description = "This email is already in use. Please log in or use a different email.";
                        break;
                    case 'auth/invalid-email':
                        description = "The email address is not valid.";
                        break;
                    case 'auth/weak-password':
                        description = "The password is too weak. Please use at least 6 characters.";
                        break;
                    default:
                        description = "Failed to create an account. Please try again later.";
                }
            }
            toast({
                title: "Signup Failed",
                description: description,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
                <CardDescription>Join our community to start shopping</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus />}
                            Sign Up
                        </Button>
                    </form>
                </Form>
                <div className="mt-6 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Log In
                    </Link>
                </div>
                </CardContent>
            </Card>
        </div>
    );
}

    