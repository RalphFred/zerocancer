import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PasswordInput from "@/components/ui/password-input"
import PhoneInputComponent from "@/components/ui/phone-input"
import * as RPNInput from "react-phone-number-input"
import statesData from "@/constants/states.json"

const servicesEnum = z.enum(['screening', 'vaccine', 'treatment'])

const formSchema = z.object({
  centerName: z.string().min(2, {
    message: "Center name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  phoneNumber: z.string().min(1, {
    message: "Please enter a phone number.",
  }),
  address: z.string().min(5, {
    message: "Please enter a valid address.",
  }),
  state: z.string().min(1, {
    message: "Please select a state.",
  }),
  localGovernment: z.string().min(1, {
    message: "Please select a local government.",
  }),
  services: z.array(servicesEnum).refine((value) => value.length > 0, {
    message: 'You have to select at least one service.',
  }),
})

type FormData = z.infer<typeof formSchema>

type ScreeningCenterFormProps = {
  onSubmitSuccess: (data: FormData) => void
}

export default function ScreeningCenterForm({
  onSubmitSuccess,
}: ScreeningCenterFormProps) {
  const [selectedState, setSelectedState] = useState<string>("")
  const [localGovernments, setLocalGovernments] = useState<
    Array<{ name: string; id: number }>
  >([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      centerName: "",
      email: "",
      password: "",
      phoneNumber: "",
      address: "",
      state: "",
      localGovernment: "",
      services: [],
    },
  })

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName)
    form.setValue("state", stateName)
    form.setValue("localGovernment", "") // Reset local government when state changes

    // Find the selected state and get its local governments
    const selectedStateData = statesData.find(
      (item) => item.state.name === stateName,
    )
    if (selectedStateData) {
      setLocalGovernments(selectedStateData.state.locals)
    } else {
      setLocalGovernments([])
    }
  }

  function onSubmit(values: FormData) {
    console.log("Screening Center form submitted:", values)
    onSubmitSuccess(values)
  }

  const servicesItems = [
    { id: 'screening', label: 'Screening' },
    { id: 'vaccine', label: 'Vaccine' },
    { id: 'treatment', label: 'Treatment' },
  ] as const

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="centerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Center Name</FormLabel>
              <FormControl>
                <Input placeholder="Hope Medical Center" {...field} />
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
                <Input
                  type="email"
                  placeholder="contact@hopemedical.com"
                  {...field}
                />
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
                <PasswordInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Enter your password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <PhoneInputComponent
                  value={field.value as RPNInput.Value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Healthway, Ikeja" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="services"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Services Offered</FormLabel>
              <FormDescription>Select all services offered at your center.</FormDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                {servicesItems.map((item) => (
                  <Button
                    type="button"
                    key={item.id}
                    variant={
                      field.value.includes(item.id) ? 'default' : 'outline'
                    }
                    onClick={() => {
                      const currentServices = field.value
                      const newServices = currentServices.includes(item.id)
                        ? currentServices.filter((s) => s !== item.id)
                        : [...currentServices, item.id]
                      field.onChange(newServices)
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
    </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={() => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={handleStateChange} value={selectedState}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statesData.map((item) => (
                    <SelectItem key={item.state.id} value={item.state.name}>
                      {item.state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="localGovernment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Government</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedState}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedState
                          ? "Select a local government"
                          : "Select a state first"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {localGovernments.map((local) => (
                    <SelectItem key={local.id} value={local.name}>
                      {local.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </Form>
  )
}