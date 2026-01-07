import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { api } from "../api/client"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            email: "admin@demo.com",
            password: "",
        },
    })

    // Mutation to call API
    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const response = await api.post('/auth/login', values);
            return response.data;
        },
        onSuccess: (data) => {
            login(data.token, data.user);
            toast.success("Login successful");
            navigate('/dashboard');
        },
        onError: () => {
            toast.error("Invalid credentials");
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Rent Manager</CardTitle>
                    <CardDescription>Login to manage your properties</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@demo.com" {...field} />
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
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
