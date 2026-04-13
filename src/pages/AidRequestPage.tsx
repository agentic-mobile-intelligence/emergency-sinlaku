import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, ChevronLeft, Phone, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type ServiceType = Database["public"]["Enums"]["service_type"]
type MedicalNeed = Database["public"]["Enums"]["medical_need"]
type Accessibility = Database["public"]["Enums"]["accessibility"]

const NEEDS_OPTIONS: Array<{ value: ServiceType | "other"; label: string }> = [
  { value: "food", label: "Food" },
  { value: "water", label: "Water" },
  { value: "shelter", label: "Shelter" },
  { value: "tarps", label: "Tarps" },
  { value: "medical", label: "Medical" },
  { value: "clothing", label: "Clothing" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
]

const MEDICAL_OPTIONS: Array<{ value: MedicalNeed; label: string }> = [
  { value: "wheelchair", label: "Wheelchair" },
  { value: "oxygen_ventilator", label: "Oxygen / Ventilator" },
  { value: "dialysis", label: "Dialysis" },
  { value: "insulin_medication", label: "Insulin / Medication" },
  { value: "mobility_aid", label: "Mobility Aid" },
  { value: "other", label: "Other" },
]

const EMERGENCY_CONTACTS = [
  { label: "Emergency", number: "911" },
  { label: "FEMA", number: "1-800-621-3362" },
  { label: "Red Cross", number: "1-800-733-2767" },
]

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    island: z.enum(["guam", "saipan", "tinian", "rota"] as const, {
      error: "Island is required",
    }),
    landline_phone: z.string().optional(),
    mobile_phone: z.string().optional(),
    email: z
      .string()
      .optional()
      .refine(
        (v) => !v || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "Invalid email address"
      ),
    no_contact_explanation: z.string().optional(),
    household_size: z.number().min(1, "Must be at least 1"),
    needs: z.array(z.string()).min(1, "Select at least one need"),
    medical_needs: z.array(z.string()),
    elderly_count: z.number().min(0).optional().nullable(),
    children_count: z.number().min(0).optional().nullable(),
    disabled_count: z.number().min(0).optional().nullable(),
    cannot_relocate: z.boolean(),
    dogs_nearby: z.boolean(),
    safely_accessible: z.enum(["yes", "no", "unsure"] as const),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasContact =
      data.landline_phone?.trim() || data.mobile_phone?.trim() || data.email?.trim()
    if (!hasContact && !data.no_contact_explanation?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please explain why you cannot provide contact information",
        path: ["no_contact_explanation"],
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

export default function AidRequestPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      household_size: 1,
      needs: [],
      medical_needs: [],
      elderly_count: 0,
      children_count: 0,
      disabled_count: 0,
      cannot_relocate: false,
      dogs_nearby: false,
      safely_accessible: "unsure",
      landline_phone: "",
      mobile_phone: "",
      email: "",
      notes: "",
    },
  })

  const landlinePhone = watch("landline_phone")
  const mobilePhone = watch("mobile_phone")
  const emailValue = watch("email")
  const needsValue = watch("needs")
  const medicalNeedsValue = watch("medical_needs")
  const cannotRelocate = watch("cannot_relocate")
  const dogsNearby = watch("dogs_nearby")
  const safelyAccessible = watch("safely_accessible")

  const hasContact = !!(landlinePhone?.trim() || mobilePhone?.trim() || emailValue?.trim())

  function toggleArrayValue(field: "needs" | "medical_needs", value: string) {
    const current = field === "needs" ? needsValue : medicalNeedsValue
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setValue(field, next, { shouldValidate: true })
  }

  async function onSubmit(data: FormValues) {
    const validNeeds = data.needs.filter((n): n is ServiceType => n !== "other")

    const { error } = await supabase.from("aid_requests").insert({
      name: data.name,
      island: data.island,
      landline_phone: data.landline_phone?.trim() || null,
      mobile_phone: data.mobile_phone?.trim() || null,
      email: data.email?.trim() || null,
      no_contact_explanation: !hasContact ? (data.no_contact_explanation ?? null) : null,
      household_size: data.household_size,
      needs: validNeeds,
      medical_needs:
        data.medical_needs.length > 0 ? (data.medical_needs as MedicalNeed[]) : null,
      elderly_count: data.elderly_count ?? null,
      children_count: data.children_count ?? null,
      disabled_count: data.disabled_count ?? null,
      cannot_relocate: data.cannot_relocate,
      dogs_nearby: data.dogs_nearby,
      safely_accessible: data.safely_accessible,
      notes: data.notes?.trim() || null,
    })

    if (error) {
      toast.error("Failed to submit request. Please try again.")
      console.error(error)
      return
    }

    setSubmitted(true)
    toast.success("Aid request submitted.")
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="text-2xl font-bold">Request Submitted</div>
            <p className="text-muted-foreground">
              Your aid request has been received. Relief organizations will reach out when
              resources become available.
            </p>
            <p className="text-sm text-muted-foreground">
              If you are in immediate danger, call <strong>911</strong>.
            </p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full mt-2">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-destructive-foreground hover:bg-destructive-foreground/10 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
          <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">
            Request Aid — Typhoon Sinlaku
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Emergency Contacts */}
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EMERGENCY_CONTACTS.map((c) => (
                <a
                  key={c.number}
                  href={`tel:${c.number.replace(/-/g, "")}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <span className="text-muted-foreground text-xs">{c.label}</span>
                  <span className="font-mono font-semibold">{c.number}</span>
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              All services are subject to availability. Call 911 immediately if you are in
              danger.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Banner */}
        <div className="flex items-start gap-2 rounded-md border border-green-800/50 bg-green-950/20 px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Privacy: </span>
            We do not collect Social Security Numbers or home addresses. Only the information
            below is stored to connect you with relief resources.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input id="name" {...register("name")} placeholder="Your name" />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="island">
                  Island <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="island"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="island">
                        <SelectValue placeholder="Select your island" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guam">Guam</SelectItem>
                        <SelectItem value="saipan">Saipan</SelectItem>
                        <SelectItem value="tinian">Tinian</SelectItem>
                        <SelectItem value="rota">Rota</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.island && (
                  <p className="text-xs text-destructive">{errors.island.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="landline_phone">Landline Phone</Label>
                  <Input
                    id="landline_phone"
                    {...register("landline_phone")}
                    placeholder="671-000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile_phone">Mobile Phone</Label>
                  <Input
                    id="mobile_phone"
                    {...register("mobile_phone")}
                    placeholder="671-000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {!hasContact && (
                <div className="rounded-md border border-amber-700/50 bg-amber-950/20 p-3 space-y-1.5">
                  <Label htmlFor="no_contact_explanation">
                    Why can't you be contacted?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="no_contact_explanation"
                    {...register("no_contact_explanation")}
                    placeholder="e.g. No phone service, device damaged, no electricity..."
                    rows={3}
                  />
                  {errors.no_contact_explanation && (
                    <p className="text-xs text-destructive">
                      {errors.no_contact_explanation.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Household */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Household</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="household_size">Total Household Size</Label>
                <Input
                  id="household_size"
                  type="number"
                  min={1}
                  {...register("household_size", { valueAsNumber: true })}
                  className="w-28"
                />
                {errors.household_size && (
                  <p className="text-xs text-destructive">{errors.household_size.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="elderly_count">Elderly (65+)</Label>
                  <Input
                    id="elderly_count"
                    type="number"
                    min={0}
                    {...register("elderly_count", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="children_count">Children (&lt;18)</Label>
                  <Input
                    id="children_count"
                    type="number"
                    min={0}
                    {...register("children_count", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="disabled_count">Disabled</Label>
                  <Input
                    id="disabled_count"
                    type="number"
                    min={0}
                    {...register("disabled_count", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Needs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                What Do You Need? <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {NEEDS_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`need-${opt.value}`}
                      checked={needsValue.includes(opt.value)}
                      onCheckedChange={() => toggleArrayValue("needs", opt.value)}
                    />
                    <Label
                      htmlFor={`need-${opt.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.needs && (
                <p className="text-xs text-destructive mt-2">{errors.needs.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Medical Needs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Medical Needs</CardTitle>
              <p className="text-xs text-muted-foreground">Select all that apply</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {MEDICAL_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`medical-${opt.value}`}
                      checked={medicalNeedsValue.includes(opt.value)}
                      onCheckedChange={() => toggleArrayValue("medical_needs", opt.value)}
                    />
                    <Label
                      htmlFor={`medical-${opt.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Safety Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Safety Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="cannot_relocate"
                  checked={cannotRelocate}
                  onCheckedChange={(v) => setValue("cannot_relocate", !!v)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="cannot_relocate"
                  className="font-normal cursor-pointer leading-snug"
                >
                  I cannot leave my current location
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Dogs nearby?</Label>
                <RadioGroup
                  value={dogsNearby ? "yes" : "no"}
                  onValueChange={(v) => setValue("dogs_nearby", v === "yes")}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="dogs-yes" />
                    <Label htmlFor="dogs-yes" className="font-normal cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="dogs-no" />
                    <Label htmlFor="dogs-no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Is your location safely accessible to relief workers?
                </Label>
                <RadioGroup
                  value={safelyAccessible}
                  onValueChange={(v) => setValue("safely_accessible", v as Accessibility)}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="access-yes" />
                    <Label htmlFor="access-yes" className="font-normal cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="access-no" />
                    <Label htmlFor="access-no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="unsure" id="access-unsure" />
                    <Label htmlFor="access-unsure" className="font-normal cursor-pointer">
                      Unsure
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("notes")}
                placeholder="Any additional information that may help relief workers reach you..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Aid Request"}
          </Button>
        </form>
      </main>
    </div>
  )
}
