import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models/service.model";

const SEED_SERVICES = [
  {
    name: "Book a Service Appointment",
    slug: "book-service-appointment",
    type: "appointment",
    description:
      "Schedule a service appointment at your nearest Honda dealer. Choose your preferred date and time.",
    thumbnail: "",
    banner: "",
  },
  {
    name: "Pickup & Drop Service",
    slug: "pickup-drop-service",
    type: "pickup-drop",
    description:
      "We pick up your Honda from your doorstep, service it, and deliver it back. Hassle-free.",
    thumbnail: "",
    banner: "",
  },
  {
    name: "Service Schedule",
    slug: "service-schedule",
    type: "schedule",
    description:
      "View the recommended maintenance schedule for your Honda model based on kilometers driven.",
    thumbnail: "",
    banner: "",
  },
];

/**
 * POST /api/admin/seed-services
 *
 * Seeds the services collection with default Honda service types.
 * Only works if zero services exist — prevents duplicates.
 */
export async function POST() {
  try {
    await connectDB();

    const existing = await Service.countDocuments();
    if (existing > 0) {
      return Response.json(
        { success: false, error: "Services already exist. Seed blocked." },
        { status: 403 }
      );
    }

    const services = await Service.insertMany(SEED_SERVICES);

    return Response.json({
      success: true,
      message: `${services.length} services seeded successfully.`,
      data: services,
    });
  } catch (error: any) {
    console.error("Service seed error:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
